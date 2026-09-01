-- F1-CP8 remote quota and RLS verification.
-- Requires two users who have signed in. All changes are rolled back.

begin;

create temporary table f1_cp8_test_users (
  label text primary key,
  id uuid not null unique
) on commit drop;

insert into f1_cp8_test_users (label, id)
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
  if (select count(*) from f1_cp8_test_users) < 2 then
    raise exception 'F1-CP8 verification requires two authenticated test users.';
  end if;
end;
$$;

select set_config(
  'fintrack.test_user_a',
  (select id::text from f1_cp8_test_users where label = 'user_a'),
  true
);
select set_config(
  'fintrack.test_user_b',
  (select id::text from f1_cp8_test_users where label = 'user_b'),
  true
);

delete from public.ai_request_events
where user_id in (
  current_setting('fintrack.test_user_a')::uuid,
  current_setting('fintrack.test_user_b')::uuid
);

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
declare
  v_accepted boolean;
  v_reason text;
  v_first_request uuid := gen_random_uuid();
begin
  select accepted, reason
  into v_accepted, v_reason
  from public.consume_receipt_ai_quota(v_first_request);

  if not v_accepted or v_reason <> 'accepted' then
    raise exception 'First quota request was not accepted.';
  end if;

  for counter in 1..3 loop
    select accepted, reason
    into v_accepted, v_reason
    from public.consume_receipt_ai_quota(gen_random_uuid());

    if not v_accepted or v_reason <> 'accepted' then
      raise exception 'Expected four accepted requests per minute.';
    end if;
  end loop;

  select accepted, reason
  into v_accepted, v_reason
  from public.consume_receipt_ai_quota(gen_random_uuid());

  if v_accepted or v_reason <> 'minute' then
    raise exception 'Fifth request must be rejected by the minute limit.';
  end if;

  select accepted, reason
  into v_accepted, v_reason
  from public.consume_receipt_ai_quota(v_first_request);

  if v_accepted or v_reason <> 'duplicate' then
    raise exception 'Duplicate request ID must not trigger another analysis.';
  end if;
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
    from public.ai_request_events
    where user_id = current_setting('fintrack.test_user_a')::uuid
  ) then
    raise exception 'RLS failure: User B can read User A request ledger.';
  end if;

  if not (
    select accepted
    from public.consume_receipt_ai_quota(gen_random_uuid())
  ) then
    raise exception 'User B own quota request was not accepted.';
  end if;
end;
$$;

reset role;

do $$
begin
  raise notice 'F1-CP8 PASS: quota limits, duplicate protection, and cross-user isolation work.';
end;
$$;

rollback;
