begin;

-- This queue intentionally survives auth.users deletion, including ambiguous
-- Auth API responses. It stores no email, receipt content, or financial data.
create table public.account_deletion_requests (
  user_id uuid primary key,
  request_id uuid not null unique default gen_random_uuid(),
  requested_at timestamptz not null default now(),
  not_before timestamptz not null,
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text check (last_error_code in ('storage', 'auth', 'database')),
  constraint account_deletion_lease_pair check (
    (lease_token is null) = (lease_until is null)
  )
);
create index account_deletion_due_idx
  on public.account_deletion_requests (not_before, requested_at);

create table public.account_storage_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  drain_until timestamptz not null
);

-- A bounded pseudonymous authorization proof for late-object reconciliation.
-- Never infer deletion authority just because an ID is absent from Auth.
create table public.account_deletion_cleanup_proofs (
  owner_hash text primary key check (owner_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null
);
create index account_deletion_proofs_expiry_idx on public.account_deletion_cleanup_proofs (expires_at);

-- Bounded orphan reconciliation resumes across daily runs. No personal data
-- besides the last scanned object key; the cursor resets after a full pass.
create table public.maintenance_cursors (
  name text primary key check (name = 'receipt_orphans'),
  value text not null default '' check (char_length(value) <= 1024)
);
insert into public.maintenance_cursors (name) values ('receipt_orphans');

alter table public.account_deletion_requests enable row level security;
alter table public.account_storage_activity enable row level security;
alter table public.account_deletion_cleanup_proofs enable row level security;
alter table public.maintenance_cursors enable row level security;
revoke all on public.account_deletion_requests, public.account_storage_activity,
  public.account_deletion_cleanup_proofs, public.maintenance_cursors from public, anon, authenticated;
grant select, insert, update, delete on public.account_deletion_requests,
  public.account_storage_activity, public.account_deletion_cleanup_proofs, public.maintenance_cursors to service_role;

-- The only authenticated RPC exposes the caller's state, never another user's
-- identity. SECURITY DEFINER is needed to check private Auth session records.
create function public.get_account_access_state()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  session_text text := auth.jwt()->>'session_id';
begin
  if caller_id is null or session_text is null
    or session_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then return 'signed_out'; end if;

  if not exists (
    select 1 from auth.sessions s join auth.users u on u.id = s.user_id
    where s.id = session_text::uuid and s.user_id = caller_id
      and (s.not_after is null or s.not_after > now())
      and u.deleted_at is null
  ) then return 'signed_out'; end if;

  if exists (select 1 from public.account_deletion_requests d where d.user_id = caller_id)
  then return 'deleting'; end if;
  return 'active';
end;
$$;
revoke all on function public.get_account_access_state() from public, anon;
grant execute on function public.get_account_access_state() to authenticated;

-- Restrictive policies compose with existing ownership checks; a stale JWT
-- alone can no longer read/write application data after session/account removal.
create policy "Active account required" on public.transactions as restrictive
  for all to authenticated
  using ((select public.get_account_access_state()) = 'active')
  with check ((select public.get_account_access_state()) = 'active');
create policy "Active account required" on public.weekly_insights as restrictive
  for all to authenticated
  using ((select public.get_account_access_state()) = 'active')
  with check ((select public.get_account_access_state()) = 'active');
create policy "Active account required" on public.ai_request_events as restrictive
  for all to authenticated
  using ((select public.get_account_access_state()) = 'active')
  with check ((select public.get_account_access_state()) = 'active');

-- Serialize the acceptance barrier against writes, including service-role
-- insight writes. DELETE cascades deliberately remain available to Auth.
create function private.guard_account_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'Account ownership cannot change' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock_shared(pg_catalog.hashtextextended(new.user_id::text, 10));
  if exists (select 1 from public.account_deletion_requests where user_id = new.user_id) then
    raise exception 'Account deletion in progress' using errcode = 'P0010';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_account_write() from public, anon, authenticated;
create trigger transactions_account_write_guard before insert or update on public.transactions
  for each row execute function private.guard_account_write();
create trigger weekly_insights_account_write_guard before insert or update on public.weekly_insights
  for each row execute function private.guard_account_write();
create trigger ai_request_events_account_write_guard before insert or update on public.ai_request_events
  for each row execute function private.guard_account_write();

-- Reserve BEFORE signing/copying, with the same per-account lock as deletion.
-- Return a fixed signing timestamp so a delayed signer cannot extend the URL.
create function public.reserve_account_storage(p_user_id uuid, p_kind text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  reserved_at timestamptz := clock_timestamp();
  drain_end timestamptz;
begin
  if p_kind not in ('upload', 'copy') or p_kind is null then
    raise exception 'Invalid storage operation' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 10));
  if not exists (select 1 from auth.users where id = p_user_id and deleted_at is null)
    or exists (select 1 from public.account_deletion_requests where user_id = p_user_id)
  then raise exception 'Account unavailable' using errcode = 'P0010'; end if;
  reserved_at := clock_timestamp();
  drain_end := reserved_at + case when p_kind = 'upload' then interval '5 minutes' else interval '3 minutes' end;
  insert into public.account_storage_activity (user_id, drain_until)
  values (p_user_id, drain_end)
  on conflict (user_id) do update
    set drain_until = greatest(public.account_storage_activity.drain_until, excluded.drain_until);
  return reserved_at;
end;
$$;

create function public.begin_account_deletion(p_user_id uuid)
returns public.account_deletion_requests
language plpgsql
security definer
set search_path = ''
as $$
declare result public.account_deletion_requests;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 10));
  select * into result from public.account_deletion_requests where user_id = p_user_id;
  if found then return result; end if;
  if not exists (select 1 from auth.users where id = p_user_id and deleted_at is null) then
    raise exception 'Account unavailable' using errcode = 'P0010';
  end if;
  insert into public.account_deletion_requests (user_id, not_before)
  values (p_user_id, greatest(clock_timestamp() + interval '3 minutes',
    (select drain_until from public.account_storage_activity where user_id = p_user_id)))
  returning * into result;
  return result;
end;
$$;

create function public.claim_account_deletion(p_user_id uuid, p_lease_token uuid)
returns setof public.account_deletion_requests
language sql
security invoker
set search_path = ''
as $$
  update public.account_deletion_requests
  set lease_token = p_lease_token, lease_until = clock_timestamp() + interval '2 minutes',
    attempts = attempts + 1, last_error_code = null
  where user_id = p_user_id and not_before <= clock_timestamp()
    and (lease_until is null or lease_until < clock_timestamp())
  returning *;
$$;

revoke all on function public.reserve_account_storage(uuid, text),
  public.begin_account_deletion(uuid), public.claim_account_deletion(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.reserve_account_storage(uuid, text),
  public.begin_account_deletion(uuid), public.claim_account_deletion(uuid, uuid)
  to service_role;

-- Keep the existing aggregate contract while excluding accounts being deleted.
alter function public.get_weekly_insight_candidates(date)
  rename to get_weekly_insight_candidates_before_cp10;
revoke all on function public.get_weekly_insight_candidates_before_cp10(date) from public, anon, authenticated;
create function public.get_weekly_insight_candidates(p_week_start date)
returns table (
  user_id uuid, week_start date, week_end date, transaction_count integer,
  total_amount_idr bigint, previous_total_amount_idr bigint,
  top_category_name text, top_category_amount_idr bigint, category_totals jsonb
)
language sql stable security invoker set search_path = ''
as $$
  select candidate.* from public.get_weekly_insight_candidates_before_cp10(p_week_start) candidate
  where not exists (select 1 from public.account_deletion_requests d where d.user_id = candidate.user_id);
$$;
revoke all on function public.get_weekly_insight_candidates(date) from public, anon, authenticated;
grant execute on function public.get_weekly_insight_candidates(date) to service_role;

comment on table public.account_deletion_requests is
  'Minimal durable deletion progress; server-only, removed after storage/Auth/cascade verification.';
notify pgrst, 'reload schema';
commit;
