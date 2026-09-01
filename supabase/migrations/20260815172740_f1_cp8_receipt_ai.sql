create table public.ai_request_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid not null,
  feature text not null,
  created_at timestamptz not null default statement_timestamp(),
  constraint ai_request_events_user_request_unique unique (user_id, request_id),
  constraint ai_request_events_feature_check check (feature = 'receipt_extraction')
);

alter table public.ai_request_events enable row level security;

revoke all on table public.ai_request_events from public, anon, authenticated;
grant select, insert on table public.ai_request_events to authenticated;
grant select, insert, update, delete on table public.ai_request_events to service_role;

create policy "ai_request_events_select_own"
on public.ai_request_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "ai_request_events_insert_own"
on public.ai_request_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create index ai_request_events_user_feature_created_idx
on public.ai_request_events (user_id, feature, created_at desc);

create or replace function public.consume_receipt_ai_quota(p_request_id uuid)
returns table (accepted boolean, reason text, retry_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_now timestamptz := statement_timestamp();
  v_minute_count integer;
  v_minute_first timestamptz;
  v_day_count integer;
  v_day_start timestamptz;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 481203)
  );

  if exists (
    select 1
    from public.ai_request_events
    where user_id = v_user_id
      and request_id = p_request_id
  ) then
    return query select false, 'duplicate'::text, null::timestamptz;
    return;
  end if;

  select count(*)::integer, min(created_at)
  into v_minute_count, v_minute_first
  from public.ai_request_events
  where user_id = v_user_id
    and feature = 'receipt_extraction'
    and created_at > v_now - interval '1 minute';

  if v_minute_count >= 4 then
    return query
      select false, 'minute'::text, v_minute_first + interval '1 minute';
    return;
  end if;

  v_day_start := (
    pg_catalog.date_trunc('day', v_now at time zone 'Asia/Jakarta')
    at time zone 'Asia/Jakarta'
  );

  select count(*)::integer
  into v_day_count
  from public.ai_request_events
  where user_id = v_user_id
    and feature = 'receipt_extraction'
    and created_at >= v_day_start;

  if v_day_count >= 20 then
    return query
      select
        false,
        'day'::text,
        (
          pg_catalog.date_trunc('day', v_now at time zone 'Asia/Jakarta')
          + interval '1 day'
        ) at time zone 'Asia/Jakarta';
    return;
  end if;

  insert into public.ai_request_events (user_id, request_id, feature)
  values (v_user_id, p_request_id, 'receipt_extraction');

  return query select true, 'accepted'::text, null::timestamptz;
end;
$$;

revoke all on function public.consume_receipt_ai_quota(uuid)
from public, anon, authenticated;
grant execute on function public.consume_receipt_ai_quota(uuid) to authenticated;

create unique index transactions_receipt_object_key_unique_idx
on public.transactions (receipt_object_key)
where receipt_object_key is not null;

comment on table public.ai_request_events is
  'Persistent per-user receipt extraction request accounting. No receipt image or model output is stored here.';
