begin;

-- Budgets are account-wide monthly limits. Wallets identify payment sources
-- for transactions and must not split or own a category budget.
drop function if exists public.get_wallet_deletion_summaries();
drop function if exists public.delete_wallet_with_data(uuid);

-- Preserve the total limit previously shown in the all-wallet view. If more
-- than one wallet has a limit for the same category and month, keep one row
-- and merge the limits by addition before removing wallet ownership.
do $$
begin
  if exists (
    select 1
    from public.category_budgets as budget
    group by budget.user_id, budget.category_id, budget.month_start
    having sum(budget.limit_amount_idr::numeric) > 999999999999
  ) then
    raise exception 'merged category budget exceeds supported limit'
      using errcode = '22003';
  end if;
end;
$$;

with ranked_budgets as (
  select
    budget.id,
    row_number() over (
      partition by budget.user_id, budget.category_id, budget.month_start
      order by budget.created_at, budget.id
    ) as row_number,
    sum(budget.limit_amount_idr) over (
      partition by budget.user_id, budget.category_id, budget.month_start
    )::bigint as merged_limit_amount_idr
  from public.category_budgets as budget
)
update public.category_budgets as budget
set limit_amount_idr = ranked.merged_limit_amount_idr
from ranked_budgets as ranked
where budget.id = ranked.id
  and ranked.row_number = 1;

with ranked_budgets as (
  select
    budget.id,
    row_number() over (
      partition by budget.user_id, budget.category_id, budget.month_start
      order by budget.created_at, budget.id
    ) as row_number
  from public.category_budgets as budget
)
delete from public.category_budgets as budget
using ranked_budgets as ranked
where budget.id = ranked.id
  and ranked.row_number > 1;

alter table public.category_budgets
  drop constraint if exists category_budgets_user_wallet_fkey,
  drop constraint if exists category_budgets_user_wallet_category_month_unique;

drop index if exists public.category_budgets_user_wallet_month_idx;

alter table public.category_budgets
  drop column if exists wallet_id;

alter table public.category_budgets
  add constraint category_budgets_user_category_month_unique
  unique (user_id, category_id, month_start);

create index category_budgets_user_month_idx
on public.category_budgets (user_id, month_start, category_id);

comment on table public.category_budgets is
  'Owner-scoped monthly spending limits per category across every wallet.';

create function public.get_wallet_deletion_summaries()
returns table (
  wallet_id uuid,
  transaction_count integer,
  receipt_count integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    wallet.id,
    (
      select count(*)::integer
      from public.transactions as transaction_row
      where transaction_row.user_id = wallet.user_id
        and transaction_row.wallet_id = wallet.id
    ),
    (
      select count(*)::integer
      from public.transactions as transaction_row
      where transaction_row.user_id = wallet.user_id
        and transaction_row.wallet_id = wallet.id
        and transaction_row.receipt_object_key is not null
    )
  from public.wallets as wallet
  where wallet.user_id = auth.uid()
  order by wallet.created_at, wallet.id;
$$;

revoke all on function public.get_wallet_deletion_summaries()
from public, anon;
grant execute on function public.get_wallet_deletion_summaries()
to authenticated;

create function public.delete_wallet_with_data(p_wallet_id uuid)
returns table (
  deleted_wallet_id uuid,
  transaction_count integer,
  receipt_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction_count integer;
  v_receipt_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if public.get_account_access_state() <> 'active' then
    raise exception 'active account required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.wallets as wallet
    where wallet.id = p_wallet_id and wallet.user_id = v_user_id
  ) then
    raise exception 'wallet not found' using errcode = 'P0002';
  end if;

  select count(*)::integer,
    count(*) filter (
      where transaction_row.receipt_object_key is not null
    )::integer
  into v_transaction_count, v_receipt_count
  from public.transactions as transaction_row
  where transaction_row.user_id = v_user_id
    and transaction_row.wallet_id = p_wallet_id;

  -- Stored narratives summarize account aggregates. Removing transactions
  -- makes them stale, while account-wide category budgets remain valid.
  delete from public.weekly_insights where user_id = v_user_id;
  delete from public.monthly_insights where user_id = v_user_id;

  delete from public.wallets
  where id = p_wallet_id and user_id = v_user_id;

  return query select
    p_wallet_id,
    v_transaction_count,
    v_receipt_count;
end;
$$;

revoke all on function public.delete_wallet_with_data(uuid)
from public, anon;
grant execute on function public.delete_wallet_with_data(uuid)
to authenticated;

notify pgrst, 'reload schema';
commit;
