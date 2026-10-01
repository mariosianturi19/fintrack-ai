-- DEVELOPMENT ONLY. Synthetic fixtures are rolled back. This script verifies
-- explicit user-created wallets, owner isolation, scoped aggregates, and
-- permanent transaction cascade deletion while global budgets remain intact.
begin;
select set_config('fintrack.f3_a', gen_random_uuid()::text, true);
select set_config('fintrack.f3_b', gen_random_uuid()::text, true);
select set_config('fintrack.f3_sa', gen_random_uuid()::text, true);
select set_config('fintrack.f3_sb', gen_random_uuid()::text, true);
select set_config('fintrack.f3_wallet_a', gen_random_uuid()::text, true);
select set_config('fintrack.f3_wallet_a2', gen_random_uuid()::text, true);
select set_config('fintrack.f3_wallet_b', gen_random_uuid()::text, true);

insert into auth.users (id, email, aud, role, created_at, updated_at)
select id::uuid, 'f3-' || id || '@example.invalid', 'authenticated', 'authenticated', now(), now()
from (values (current_setting('fintrack.f3_a')), (current_setting('fintrack.f3_b'))) as fixture(id);
insert into auth.sessions (id, user_id, created_at, updated_at) values
  (current_setting('fintrack.f3_sa')::uuid, current_setting('fintrack.f3_a')::uuid, now(), now()),
  (current_setting('fintrack.f3_sb')::uuid, current_setting('fintrack.f3_b')::uuid, now(), now());

do $$
begin
  if exists (
    select 1
    from public.wallets as wallet
    where wallet.user_id in (
      current_setting('fintrack.f3_a')::uuid,
      current_setting('fintrack.f3_b')::uuid
    )
  ) then
    raise exception 'F3: account creation still created a system wallet';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', current_setting('fintrack.f3_a'), true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', current_setting('fintrack.f3_a'),
    'session_id', current_setting('fintrack.f3_sa'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

insert into public.wallets (id, user_id, name, wallet_type) values
  (current_setting('fintrack.f3_wallet_a')::uuid, auth.uid(), 'BCA', 'bank'),
  (current_setting('fintrack.f3_wallet_a2')::uuid, auth.uid(), 'GoPay', 'e_wallet');

do $$
begin
  begin
    insert into public.transactions (
      user_id, category_id, amount_idr, transaction_date, notes
    ) values (
      auth.uid(),
      (select id from public.categories where slug = 'food-drink'),
      500,
      '2026-09-30',
      'Missing wallet must fail'
    );
    raise exception 'F3: transaction without explicit wallet was accepted';
  exception when not_null_violation then null;
  end;
end;
$$;

insert into public.transactions (
  user_id, category_id, wallet_id, amount_idr, transaction_date, notes
) values (
  auth.uid(),
  (select id from public.categories where slug = 'food-drink'),
  current_setting('fintrack.f3_wallet_a')::uuid,
  12500,
  '2026-09-30',
  'F3 permanent-delete fixture'
);
insert into public.category_budgets (
  user_id, category_id, month_start, limit_amount_idr
) values (
  auth.uid(),
  (select id from public.categories where slug = 'food-drink'),
  '2026-09-01',
  100000
);

reset role;
select set_config('request.jwt.claim.sub', current_setting('fintrack.f3_b'), true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', current_setting('fintrack.f3_b'),
    'session_id', current_setting('fintrack.f3_sb'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;
insert into public.wallets (id, user_id, name, wallet_type)
values (current_setting('fintrack.f3_wallet_b')::uuid, auth.uid(), 'OVO', 'e_wallet');
reset role;

select set_config('request.jwt.claim.sub', current_setting('fintrack.f3_a'), true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', current_setting('fintrack.f3_a'),
    'session_id', current_setting('fintrack.f3_sa'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

do $$
declare
  scoped_total bigint;
  all_total bigint;
  deleted_rows integer;
begin
  if (select count(*) from public.wallets) <> 2 then
    raise exception 'F3: wallet owner isolation failed';
  end if;
  select coalesce(sum(spent_amount_idr), 0) into scoped_total
  from public.get_category_spending(
    '2026-09-01', '2026-09-30', current_setting('fintrack.f3_wallet_a')::uuid
  );
  select coalesce(sum(spent_amount_idr), 0) into all_total
  from public.get_category_spending('2026-09-01', '2026-09-30', null);
  if scoped_total <> 12500 or all_total <> 12500 then
    raise exception 'F3: wallet aggregate scope is invalid';
  end if;
  begin
    perform * from public.get_category_spending(
      '2026-09-01', '2026-09-30', current_setting('fintrack.f3_wallet_b')::uuid
    );
    raise exception 'F3: cross-owner aggregate scope was accepted';
  exception when insufficient_privilege then null;
  end;
  begin
    perform * from public.delete_wallet_with_data(
      current_setting('fintrack.f3_wallet_b')::uuid
    );
    raise exception 'F3: cross-owner wallet deletion was accepted';
  exception when no_data_found then null;
  end;

  select count(*) into deleted_rows
  from public.delete_wallet_with_data(
    current_setting('fintrack.f3_wallet_a')::uuid
  ) as deleted
  where deleted.transaction_count = 1
    and deleted.receipt_count = 0;
  if deleted_rows <> 1 then
    raise exception 'F3: permanent deletion summary is invalid';
  end if;
  if exists (
    select 1 from public.transactions
    where wallet_id = current_setting('fintrack.f3_wallet_a')::uuid
  ) then
    raise exception 'F3: wallet-owned transactions did not cascade';
  end if;
  if not exists (
    select 1 from public.category_budgets
    where user_id = auth.uid()
      and month_start = '2026-09-01'
      and limit_amount_idr = 100000
  ) then
    raise exception 'F3: deleting a wallet removed the global budget';
  end if;

  perform * from public.delete_wallet_with_data(
    current_setting('fintrack.f3_wallet_a2')::uuid
  );
  if exists (select 1 from public.wallets) then
    raise exception 'F3: deleting the final wallet was blocked';
  end if;
end;
$$;

reset role;
rollback;
select 'F3 isolation PASS: typed explicit creation, owner boundaries, scoped aggregates, permanent transaction deletion, and global budget preservation verified; fixtures rolled back.' as result;
