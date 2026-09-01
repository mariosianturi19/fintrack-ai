-- F1-CP4 remote verification.
--
-- Run this only after the core migration succeeds and at least two Google test
-- users have signed in once. The script wraps all test data in a transaction
-- and always rolls it back.

begin;

create temporary table f1_cp4_test_users (
  label text primary key,
  id uuid not null unique
) on commit drop;

insert into f1_cp4_test_users (label, id)
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
  if (select count(*) from f1_cp4_test_users) < 2 then
    raise exception
      'F1-CP4 isolation test requires two authenticated test users. Sign in once with a second Google test account, then rerun this script.';
  end if;
end;
$$;

select set_config(
  'fintrack.test_user_a',
  (select id::text from f1_cp4_test_users where label = 'user_a'),
  true
);

select set_config(
  'fintrack.test_user_b',
  (select id::text from f1_cp4_test_users where label = 'user_b'),
  true
);

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    current_setting('fintrack.test_user_a'),
    'role',
    'authenticated'
  )::text,
  true
);
select set_config(
  'request.jwt.claim.sub',
  current_setting('fintrack.test_user_a'),
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

set local role authenticated;

do $$
begin
  if (select count(*) from public.categories) <> 6 then
    raise exception 'Authenticated category catalog must expose exactly six active seed rows.';
  end if;
end;
$$;

with inserted as (
  insert into public.transactions (
    user_id,
    category_id,
    amount_idr,
    transaction_date,
    merchant,
    notes,
    source
  )
  values (
    current_setting('fintrack.test_user_a')::uuid,
    (select id from public.categories where slug = 'food-drink'),
    125000,
    current_date,
    'F1-CP4 Test Merchant A',
    'Temporary isolation test row',
    'manual'
  )
  returning id
)
select set_config(
  'fintrack.test_transaction_a',
  (select id::text from inserted),
  true
);

with inserted as (
  insert into public.weekly_insights (
    user_id,
    week_start,
    summary,
    model_name
  )
  values (
    current_setting('fintrack.test_user_a')::uuid,
    current_date - (extract(isodow from current_date)::integer - 1),
    'Temporary weekly insight for the F1-CP4 isolation test.',
    'f1-cp4-test-model'
  )
  returning id
)
select set_config(
  'fintrack.test_insight_a',
  (select id::text from inserted),
  true
);

do $$
begin
  if not exists (
    select 1
    from public.transactions
    where id = current_setting('fintrack.test_transaction_a')::uuid
  ) then
    raise exception 'User A cannot read the transaction they created.';
  end if;

  if not exists (
    select 1
    from public.weekly_insights
    where id = current_setting('fintrack.test_insight_a')::uuid
  ) then
    raise exception 'User A cannot read the weekly insight they created.';
  end if;
end;
$$;

reset role;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    current_setting('fintrack.test_user_b'),
    'role',
    'authenticated'
  )::text,
  true
);
select set_config(
  'request.jwt.claim.sub',
  current_setting('fintrack.test_user_b'),
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

set local role authenticated;

do $$
declare
  affected_rows integer;
  blocked_insert boolean := false;
begin
  if exists (
    select 1
    from public.transactions
    where id = current_setting('fintrack.test_transaction_a')::uuid
  ) then
    raise exception 'RLS failure: User B can read User A transaction.';
  end if;

  if exists (
    select 1
    from public.weekly_insights
    where id = current_setting('fintrack.test_insight_a')::uuid
  ) then
    raise exception 'RLS failure: User B can read User A weekly insight.';
  end if;

  update public.transactions
  set notes = 'Cross-user update must not succeed'
  where id = current_setting('fintrack.test_transaction_a')::uuid;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'RLS failure: User B updated User A transaction.';
  end if;

  delete from public.transactions
  where id = current_setting('fintrack.test_transaction_a')::uuid;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'RLS failure: User B deleted User A transaction.';
  end if;

  begin
    insert into public.transactions (
      user_id,
      category_id,
      amount_idr,
      transaction_date,
      source
    )
    values (
      current_setting('fintrack.test_user_a')::uuid,
      (select id from public.categories where slug = 'other'),
      1,
      current_date,
      'manual'
    );
  exception
    when insufficient_privilege then
      blocked_insert := true;
  end;

  if not blocked_insert then
    raise exception 'RLS failure: User B inserted a transaction owned by User A.';
  end if;
end;
$$;

with inserted as (
  insert into public.transactions (
    user_id,
    category_id,
    amount_idr,
    transaction_date,
    merchant,
    source
  )
  values (
    current_setting('fintrack.test_user_b')::uuid,
    (select id from public.categories where slug = 'transportation'),
    15000,
    current_date,
    'F1-CP4 Test Merchant B',
    'manual'
  )
  returning id
)
select set_config(
  'fintrack.test_transaction_b',
  (select id::text from inserted),
  true
);

do $$
declare
  affected_rows integer;
begin
  update public.transactions
  set notes = 'User B can update their own row'
  where id = current_setting('fintrack.test_transaction_b')::uuid;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'User B own-row update did not affect exactly one row.';
  end if;

  delete from public.transactions
  where id = current_setting('fintrack.test_transaction_b')::uuid;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'User B own-row delete did not affect exactly one row.';
  end if;
end;
$$;

reset role;

do $$
begin
  raise notice 'F1-CP4 PASS: own-row CRUD works and cross-user transaction/insight access is blocked.';
end;
$$;

rollback;
