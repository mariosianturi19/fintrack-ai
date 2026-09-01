-- DEVELOPMENT ONLY. All fixtures are synthetic, generated inside this
-- transaction. No real account is selected/deleted; everything rolls back.
begin;
select set_config('fintrack.cp10_a', gen_random_uuid()::text, true);
select set_config('fintrack.cp10_b', gen_random_uuid()::text, true);
select set_config('fintrack.cp10_sa', gen_random_uuid()::text, true);
select set_config('fintrack.cp10_sb', gen_random_uuid()::text, true);

insert into auth.users (id, email, aud, role, created_at, updated_at)
select id::uuid, 'cp10-' || id || '@example.invalid', 'authenticated', 'authenticated', now(), now()
from (values (current_setting('fintrack.cp10_a')), (current_setting('fintrack.cp10_b'))) as fixture(id);
insert into auth.sessions (id, user_id, created_at, updated_at) values
  (current_setting('fintrack.cp10_sa')::uuid, current_setting('fintrack.cp10_a')::uuid, now(), now()),
  (current_setting('fintrack.cp10_sb')::uuid, current_setting('fintrack.cp10_b')::uuid, now(), now());
insert into public.transactions (user_id, category_id, amount_idr, transaction_date, notes)
select id::uuid, (select id from public.categories where slug = 'food-drink'), 1000, '2026-08-18', 'CP10 rollback-only fixture'
from (values (current_setting('fintrack.cp10_a')), (current_setting('fintrack.cp10_b'))) as fixture(id);
insert into public.weekly_insights (user_id, week_start, summary, model_name)
values (current_setting('fintrack.cp10_a')::uuid, '2026-08-17', 'CP10 rollback fixture', 'test');
insert into public.ai_request_events (user_id, request_id, feature)
values (current_setting('fintrack.cp10_a')::uuid, gen_random_uuid(), 'receipt_extraction');

select set_config('request.jwt.claim.sub', current_setting('fintrack.cp10_a'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('fintrack.cp10_a'), 'session_id', current_setting('fintrack.cp10_sa'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
begin
  if public.get_account_access_state() <> 'active' then raise exception 'CP10: expected active account'; end if;
  if (select count(*) from public.transactions) <> 1 then raise exception 'CP10: cross-user read leak'; end if;
  begin
    perform public.begin_account_deletion(current_setting('fintrack.cp10_b')::uuid);
    raise exception 'CP10: authenticated user called privileged deletion RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform public.reserve_account_storage(current_setting('fintrack.cp10_b')::uuid, 'upload');
    raise exception 'CP10: authenticated user called privileged storage RPC';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

set local role service_role;
select public.reserve_account_storage(current_setting('fintrack.cp10_a')::uuid, 'upload');
select public.begin_account_deletion(current_setting('fintrack.cp10_a')::uuid);
do $$
declare original_id uuid; original_due timestamptz; repeated public.account_deletion_requests;
begin
  select request_id, not_before into original_id, original_due from public.account_deletion_requests where user_id = current_setting('fintrack.cp10_a')::uuid;
  repeated := public.begin_account_deletion(current_setting('fintrack.cp10_a')::uuid);
  if repeated.request_id <> original_id or repeated.not_before <> original_due then raise exception 'CP10: duplicate request changed its barrier'; end if;
  if repeated.not_before < now() + interval '4 minutes' then raise exception 'CP10: issued upload expiry not accounted for'; end if;
  if exists (select 1 from public.claim_account_deletion(repeated.user_id, gen_random_uuid())) then raise exception 'CP10: processor bypassed drain barrier'; end if;
  begin
    perform public.reserve_account_storage(repeated.user_id, 'upload');
    raise exception 'CP10: new upload permitted after acceptance';
  exception when sqlstate 'P0010' then null; end;
  begin
    perform public.reserve_account_storage(repeated.user_id, 'copy');
    raise exception 'CP10: new copy permitted after acceptance';
  exception when sqlstate 'P0010' then null; end;
  begin
    insert into public.transactions (user_id, category_id, amount_idr, transaction_date)
    values (repeated.user_id, (select id from public.categories where slug = 'food-drink'), 2000, '2026-08-18');
    raise exception 'CP10: service write bypassed deletion barrier';
  exception when sqlstate 'P0010' then null; end;
  if exists (select 1 from public.get_weekly_insight_candidates('2026-08-17') where user_id = repeated.user_id) then raise exception 'CP10: deleting account remains an insight candidate'; end if;
end;
$$;
reset role;

set local role authenticated;
do $$
begin
  if public.get_account_access_state() <> 'deleting' then raise exception 'CP10: expected pending state'; end if;
  if exists (select 1 from public.transactions) or exists (select 1 from public.weekly_insights) or exists (select 1 from public.ai_request_events) then raise exception 'CP10: pending account still reads private data'; end if;
  begin
    insert into public.transactions (user_id, category_id, amount_idr, transaction_date)
    values (auth.uid(), (select id from public.categories where slug = 'food-drink'), 2000, '2026-08-18');
    raise exception 'CP10: pending account still writes';
  exception when insufficient_privilege or sqlstate 'P0010' then null; end;
end;
$$;
reset role;

-- B remains active and can edit their own data.
select set_config('request.jwt.claim.sub', current_setting('fintrack.cp10_b'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('fintrack.cp10_b'), 'session_id', current_setting('fintrack.cp10_sb'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare changed integer;
begin
  if public.get_account_access_state() <> 'active' then raise exception 'CP10: account B was blocked'; end if;
  update public.transactions set amount_idr = 2000;
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'CP10: B update scope invalid'; end if;
end;
$$;
reset role;

-- Simulate a ready job, test mutually exclusive claims, then Auth cascade.
update public.account_deletion_requests set not_before = now() - interval '1 second' where user_id = current_setting('fintrack.cp10_a')::uuid;
set local role service_role;
do $$
declare claimed integer;
begin
  select count(*) into claimed from public.claim_account_deletion(current_setting('fintrack.cp10_a')::uuid, gen_random_uuid());
  if claimed <> 1 then raise exception 'CP10: ready request not claimable'; end if;
  if exists (select 1 from public.claim_account_deletion(current_setting('fintrack.cp10_a')::uuid, gen_random_uuid())) then raise exception 'CP10: two workers claimed one job'; end if;
  update public.account_deletion_requests set lease_until = now() - interval '1 second' where user_id = current_setting('fintrack.cp10_a')::uuid;
  select count(*) into claimed from public.claim_account_deletion(current_setting('fintrack.cp10_a')::uuid, gen_random_uuid());
  if claimed <> 1 then raise exception 'CP10: crashed-worker lease could not be recovered'; end if;
end;
$$;
reset role;
delete from auth.users where id = current_setting('fintrack.cp10_a')::uuid;
do $$
declare target uuid := current_setting('fintrack.cp10_a')::uuid;
begin
  if exists (select 1 from public.transactions where user_id = target)
    or exists (select 1 from public.weekly_insights where user_id = target)
    or exists (select 1 from public.ai_request_events where user_id = target)
    or exists (select 1 from public.account_storage_activity where user_id = target)
    or exists (select 1 from auth.sessions where user_id = target)
  then raise exception 'CP10: cascade incomplete'; end if;
  if not exists (select 1 from public.account_deletion_requests where user_id = target) then raise exception 'CP10: retry state was lost with Auth'; end if;
  if (select amount_idr from public.transactions where user_id = current_setting('fintrack.cp10_b')::uuid) <> 2000 then raise exception 'CP10: another account changed'; end if;
end;
$$;
delete from public.account_deletion_requests where user_id = current_setting('fintrack.cp10_a')::uuid;
select set_config('request.jwt.claim.sub', current_setting('fintrack.cp10_a'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('fintrack.cp10_a'), 'session_id', current_setting('fintrack.cp10_sa'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
begin
  if public.get_account_access_state() <> 'signed_out' then raise exception 'CP10: stale JWT still accepted'; end if;
  if exists (select 1 from public.transactions) then raise exception 'CP10: stale JWT reads financial data'; end if;
end;
$$;
reset role;
rollback;
select 'F1-CP10 isolation PASS: barriers, stale sessions, retries, and cascades verified; all fixtures rolled back.' as result;
