-- F1-CP9 remote aggregation, idempotency, and RLS verification.
-- Requires two users who have signed in. All changes are rolled back.

begin;

create temporary table f1_cp9_test_users (
  label text primary key,
  id uuid not null unique
) on commit drop;

insert into f1_cp9_test_users (label, id)
select
  case row_number() over (order by created_at, id)
    when 1 then 'user_a'
    when 2 then 'user_b'
  end,
  id
from auth.users
order by created_at, id
limit 2;

do $$
begin
  if (select count(*) from f1_cp9_test_users) < 2 then
    raise exception 'F1-CP9 verification requires two authenticated test users.';
  end if;
end;
$$;

select set_config(
  'fintrack.test_user_a',
  (select id::text from f1_cp9_test_users where label = 'user_a'),
  true
);
select set_config(
  'fintrack.test_user_b',
  (select id::text from f1_cp9_test_users where label = 'user_b'),
  true
);
select set_config(
  'fintrack.test_category',
  (select id::text from public.categories where is_active order by sort_order limit 1),
  true
);

insert into public.transactions (
  user_id,
  category_id,
  amount_idr,
  transaction_date,
  merchant,
  source
)
values
  (current_setting('fintrack.test_user_a')::uuid, current_setting('fintrack.test_category')::uuid, 5000, '2098-12-31', 'CP9 rollback', 'manual'),
  (current_setting('fintrack.test_user_a')::uuid, current_setting('fintrack.test_category')::uuid, 10000, '2099-01-05', 'CP9 rollback', 'manual'),
  (current_setting('fintrack.test_user_a')::uuid, current_setting('fintrack.test_category')::uuid, 20000, '2099-01-06', 'CP9 rollback', 'manual'),
  (current_setting('fintrack.test_user_b')::uuid, current_setting('fintrack.test_category')::uuid, 7000, '2099-01-07', 'CP9 rollback', 'manual');

set local role service_role;

do $$
declare
  v_user_a record;
  v_user_b record;
begin
  select * into v_user_a
  from public.get_weekly_insight_candidates('2099-01-05')
  where user_id = current_setting('fintrack.test_user_a')::uuid;

  select * into v_user_b
  from public.get_weekly_insight_candidates('2099-01-05')
  where user_id = current_setting('fintrack.test_user_b')::uuid;

  if v_user_a.total_amount_idr <> 30000
    or v_user_a.previous_total_amount_idr <> 5000
    or v_user_a.transaction_count <> 2
  then
    raise exception 'User A deterministic aggregate is incorrect.';
  end if;

  if v_user_b.total_amount_idr <> 7000
    or v_user_b.previous_total_amount_idr <> 0
    or v_user_b.transaction_count <> 1
  then
    raise exception 'User B deterministic aggregate is incorrect.';
  end if;
end;
$$;

reset role;

insert into public.weekly_insights (
  user_id,
  week_start,
  summary,
  model_name,
  transaction_count,
  total_amount_idr,
  previous_total_amount_idr,
  top_category_name,
  top_category_amount_idr
)
values (
  current_setting('fintrack.test_user_a')::uuid,
  '2099-01-05',
  'Ringkasan CP9 rollback.',
  'deterministic-v1',
  2,
  30000,
  5000,
  (select name from public.categories where id = current_setting('fintrack.test_category')::uuid),
  30000
);

do $$
begin
  begin
    insert into public.weekly_insights (
      user_id, week_start, summary, model_name
    ) values (
      current_setting('fintrack.test_user_a')::uuid,
      '2099-01-05',
      'Duplicate must fail.',
      'deterministic-v1'
    );
    raise exception 'Duplicate weekly insight was unexpectedly accepted.';
  exception
    when unique_violation then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('fintrack.test_user_a'),
    'role', 'authenticated'
  )::text,
  true
);
select set_config('request.jwt.claim.sub', current_setting('fintrack.test_user_a'), true);
select set_config('request.jwt.claim.role', 'authenticated', true);

set local role authenticated;

do $$
begin
  if not exists (
    select 1
    from public.weekly_insights
    where user_id = current_setting('fintrack.test_user_a')::uuid
      and week_start = '2099-01-05'
  ) then
    raise exception 'User A cannot read their own weekly insight.';
  end if;

  begin
    insert into public.weekly_insights (
      user_id, week_start, summary, model_name
    ) values (
      current_setting('fintrack.test_user_a')::uuid,
      '2099-01-12',
      'Authenticated mutation must fail.',
      'deterministic-v1'
    );
    raise exception 'Authenticated INSERT was unexpectedly accepted.';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('fintrack.test_user_b'),
    'role', 'authenticated'
  )::text,
  true
);
select set_config('request.jwt.claim.sub', current_setting('fintrack.test_user_b'), true);
select set_config('request.jwt.claim.role', 'authenticated', true);

set local role authenticated;

do $$
begin
  if exists (
    select 1
    from public.weekly_insights
    where user_id = current_setting('fintrack.test_user_a')::uuid
      and week_start = '2099-01-05'
  ) then
    raise exception 'RLS failure: User B can read User A weekly insight.';
  end if;
end;
$$;

reset role;

do $$
begin
  raise notice 'F1-CP9 PASS: aggregates, idempotency, read-only ownership, and cross-user isolation work.';
end;
$$;

rollback;
