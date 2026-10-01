begin;

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint wallets_user_id_id_unique unique (user_id, id),
  constraint wallets_name_format_check check (
    name = btrim(name)
    and char_length(name) between 1 and 48
  )
);

comment on table public.wallets is
  'Owner-scoped expense groupings. Wallets separate records without representing bank balances.';
comment on column public.wallets.archived_at is
  'Archived wallets remain readable for financial history but cannot receive new transactions or budgets.';

create unique index wallets_user_name_unique_idx
on public.wallets (user_id, lower(name));

create unique index wallets_user_default_unique_idx
on public.wallets (user_id)
where is_default;

create index wallets_user_active_idx
on public.wallets (user_id, archived_at, created_at);

create trigger wallets_set_updated_at
before update on public.wallets
for each row execute function private.set_updated_at();

create trigger wallets_account_write_guard
before insert or update on public.wallets
for each row execute function private.guard_account_write();

create function private.protect_default_wallet()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Auth deletion must still be able to cascade through every wallet. When the
  -- owner still exists, default wallets and wallets with financial history are
  -- protected even if a caller bypasses the application UI.
  if tg_op = 'DELETE'
    and exists (select 1 from auth.users as auth_user where auth_user.id = old.user_id)
  then
    if old.is_default then
      raise exception 'default wallet cannot be deleted' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.transactions as transaction_row
      where transaction_row.wallet_id = old.id
    ) or exists (
      select 1 from public.category_budgets as budget
      where budget.wallet_id = old.id
    ) then
      raise exception 'wallet history must be archived' using errcode = '23514';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.is_default
    and (not new.is_default or new.archived_at is not null)
  then
    raise exception 'default wallet cannot be archived or unset' using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_default_wallet()
from public, anon, authenticated;

create trigger wallets_default_guard
before update or delete on public.wallets
for each row execute function private.protect_default_wallet();

create function private.create_default_wallet_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wallets (user_id, name, is_default)
  values (new.id, 'Utama', true)
  on conflict do nothing;
  return new;
end;
$$;

revoke all on function private.create_default_wallet_for_user()
from public, anon, authenticated;

create trigger auth_user_default_wallet
after insert on auth.users
for each row execute function private.create_default_wallet_for_user();

insert into public.wallets (user_id, name, is_default)
select auth_user.id, 'Utama', true
from auth.users as auth_user
where not exists (
  select 1 from public.wallets as wallet
  where wallet.user_id = auth_user.id
);

alter table public.wallets enable row level security;
revoke all on table public.wallets from public, anon, authenticated;
grant select, insert, update, delete on table public.wallets
to authenticated, service_role;

create policy "Users can read their own wallets"
on public.wallets for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own wallets"
on public.wallets for insert to authenticated
with check ((select auth.uid()) = user_id and not is_default);

create policy "Users can update their own wallets"
on public.wallets for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own wallets"
on public.wallets for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Active account required"
on public.wallets as restrictive for all to authenticated
using ((select public.get_account_access_state()) = 'active')
with check ((select public.get_account_access_state()) = 'active');

alter table public.transactions add column wallet_id uuid;

update public.transactions as transaction_row
set wallet_id = wallet.id
from public.wallets as wallet
where wallet.user_id = transaction_row.user_id
  and wallet.is_default;

alter table public.transactions alter column wallet_id set not null;
alter table public.transactions
  add constraint transactions_user_wallet_fkey
  foreign key (user_id, wallet_id)
  references public.wallets (user_id, id)
  on delete cascade;

create index transactions_user_wallet_date_idx
on public.transactions (user_id, wallet_id, transaction_date desc, created_at desc);

alter table public.category_budgets add column wallet_id uuid;

update public.category_budgets as budget
set wallet_id = wallet.id
from public.wallets as wallet
where wallet.user_id = budget.user_id
  and wallet.is_default;

alter table public.category_budgets alter column wallet_id set not null;
alter table public.category_budgets
  add constraint category_budgets_user_wallet_fkey
  foreign key (user_id, wallet_id)
  references public.wallets (user_id, id)
  on delete cascade;

alter table public.category_budgets
  drop constraint category_budgets_user_category_month_unique;
alter table public.category_budgets
  add constraint category_budgets_user_wallet_category_month_unique
  unique (user_id, wallet_id, category_id, month_start);

drop index public.category_budgets_user_month_idx;
create index category_budgets_user_wallet_month_idx
on public.category_budgets (user_id, wallet_id, month_start, category_id);

-- Keep financial-row creation compatible during the short production interval
-- between this migration and the matching application deployment. The Phase 3
-- application always supplies wallet_id explicitly; older writes fall back to
-- the owner's default wallet instead of failing halfway through a rollout.
create function private.assign_default_wallet()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.wallet_id is null then
    select wallet.id into new.wallet_id
    from public.wallets as wallet
    where wallet.user_id = new.user_id
      and wallet.is_default
      and wallet.archived_at is null;
  end if;
  if new.wallet_id is null then
    raise exception 'default wallet required' using errcode = '23503';
  end if;
  return new;
end;
$$;

revoke all on function private.assign_default_wallet()
from public, anon, authenticated;

create trigger transactions_00_assign_default_wallet
before insert on public.transactions
for each row execute function private.assign_default_wallet();

create trigger category_budgets_00_assign_default_wallet
before insert on public.category_budgets
for each row execute function private.assign_default_wallet();

create function private.guard_active_wallet_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.wallet_id = new.wallet_id then
    return new;
  end if;

  if not exists (
    select 1 from public.wallets as wallet
    where wallet.id = new.wallet_id
      and wallet.user_id = new.user_id
      and wallet.archived_at is null
    for share
  ) then
    raise exception 'active wallet required' using errcode = '23503';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_active_wallet_write()
from public, anon, authenticated;

create trigger transactions_active_wallet_guard
before insert or update on public.transactions
for each row execute function private.guard_active_wallet_write();

create trigger category_budgets_active_wallet_guard
before insert or update on public.category_budgets
for each row execute function private.guard_active_wallet_write();

create or replace function public.get_category_spending(
  p_start_date date,
  p_end_date date,
  p_wallet_id uuid
)
returns table (
  category_id uuid,
  transaction_count integer,
  spent_amount_idr bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_start_date is null or p_end_date is null
    or p_start_date > p_end_date or p_end_date - p_start_date > 365
  then
    raise exception 'invalid spending period' using errcode = '22023';
  end if;
  if p_wallet_id is not null and not exists (
    select 1 from public.wallets as wallet
    where wallet.id = p_wallet_id and wallet.user_id = v_user_id
  ) then
    raise exception 'wallet not found' using errcode = '42501';
  end if;

  return query
  select transaction_row.category_id,
    count(*)::integer,
    sum(transaction_row.amount_idr)::bigint
  from public.transactions as transaction_row
  where transaction_row.user_id = v_user_id
    and transaction_row.transaction_date between p_start_date and p_end_date
    and (p_wallet_id is null or transaction_row.wallet_id = p_wallet_id)
  group by transaction_row.category_id;
end;
$$;

revoke all on function public.get_category_spending(date, date, uuid)
from public, anon;
grant execute on function public.get_category_spending(date, date, uuid)
to authenticated;

create or replace function public.get_finance_question_context(
  p_start_date date,
  p_end_date date,
  p_wallet_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_start_date is null or p_end_date is null
    or p_start_date > p_end_date
    or p_end_date > v_today
    or p_end_date - p_start_date > 365
  then
    raise exception 'invalid question period' using errcode = '22023';
  end if;
  if p_wallet_id is not null and not exists (
    select 1 from public.wallets as wallet
    where wallet.id = p_wallet_id and wallet.user_id = v_user_id
  ) then
    raise exception 'wallet not found' using errcode = '42501';
  end if;

  with period_transactions as (
    select transaction_row.transaction_date, transaction_row.amount_idr,
      transaction_row.category_id, transaction_row.merchant
    from public.transactions as transaction_row
    where transaction_row.user_id = v_user_id
      and transaction_row.transaction_date between p_start_date and p_end_date
      and (p_wallet_id is null or transaction_row.wallet_id = p_wallet_id)
  ),
  overall as (
    select count(*)::integer as transaction_count,
      coalesce(sum(amount_idr), 0)::bigint as total_amount_idr
    from period_transactions
  ),
  categories as (
    select category.name, count(*)::integer as transaction_count,
      sum(transaction_row.amount_idr)::bigint as total_amount_idr
    from period_transactions as transaction_row
    join public.categories as category on category.id = transaction_row.category_id
    group by category.id, category.name
  ),
  days as (
    select transaction_date, count(*)::integer as transaction_count,
      sum(amount_idr)::bigint as total_amount_idr
    from period_transactions group by transaction_date
  ),
  merchants as (
    select merchant, count(*)::integer as transaction_count,
      sum(amount_idr)::bigint as total_amount_idr
    from period_transactions
    where merchant is not null
    group by merchant
    order by total_amount_idr desc, merchant
    limit 50
  )
  select jsonb_build_object(
    'period', jsonb_build_object('startDate', p_start_date, 'endDate', p_end_date),
    'overall', (select to_jsonb(overall) from overall),
    'categories', coalesce((select jsonb_agg(to_jsonb(categories) order by total_amount_idr desc, name) from categories), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(to_jsonb(days) order by transaction_date) from days), '[]'::jsonb),
    'merchants', coalesce((select jsonb_agg(to_jsonb(merchants) order by total_amount_idr desc, merchant) from merchants), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_finance_question_context(date, date, uuid)
from public, anon;
grant execute on function public.get_finance_question_context(date, date, uuid)
to authenticated;

notify pgrst, 'reload schema';
commit;
