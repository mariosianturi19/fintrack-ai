alter table public.weekly_insights
  add column transaction_count integer not null default 0,
  add column total_amount_idr bigint not null default 0,
  add column previous_total_amount_idr bigint not null default 0,
  add column top_category_name text,
  add column top_category_amount_idr bigint;

alter table public.weekly_insights
  add constraint weekly_insights_transaction_count_check
    check (transaction_count >= 0),
  add constraint weekly_insights_total_amount_idr_check
    check (total_amount_idr >= 0),
  add constraint weekly_insights_previous_total_amount_idr_check
    check (previous_total_amount_idr >= 0),
  add constraint weekly_insights_top_category_name_check
    check (
      top_category_name is null
      or (
        top_category_name = btrim(top_category_name)
        and char_length(top_category_name) between 1 and 64
      )
    ),
  add constraint weekly_insights_top_category_amount_check
    check (
      top_category_amount_idr is null
      or (
        top_category_amount_idr > 0
        and top_category_amount_idr <= total_amount_idr
      )
    ),
  add constraint weekly_insights_top_category_pair_check
    check (
      (top_category_name is null) = (top_category_amount_idr is null)
    );

comment on column public.weekly_insights.transaction_count is
  'Deterministic transaction count for the represented Jakarta week.';
comment on column public.weekly_insights.total_amount_idr is
  'Deterministic expense total for the represented Jakarta week.';
comment on column public.weekly_insights.previous_total_amount_idr is
  'Deterministic total for the immediately preceding Jakarta week.';
comment on column public.weekly_insights.top_category_name is
  'System category label with the highest deterministic weekly total.';

revoke insert, update, delete on table public.weekly_insights from authenticated;

drop policy if exists "Users can create their own weekly insights"
on public.weekly_insights;
drop policy if exists "Users can update their own weekly insights"
on public.weekly_insights;
drop policy if exists "Users can delete their own weekly insights"
on public.weekly_insights;

create index transactions_date_user_insight_idx
on public.transactions (transaction_date, user_id, category_id)
include (amount_idr);

create or replace function public.get_weekly_insight_candidates(
  p_week_start date
)
returns table (
  user_id uuid,
  week_start date,
  week_end date,
  transaction_count integer,
  total_amount_idr bigint,
  previous_total_amount_idr bigint,
  top_category_name text,
  top_category_amount_idr bigint,
  category_totals jsonb
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_week_start is null
    or extract(isodow from p_week_start) <> 1
  then
    raise exception 'p_week_start must be a Monday'
      using errcode = '22023';
  end if;

  return query
  with current_totals as (
    select
      transaction_row.user_id,
      count(*)::integer as transaction_count,
      sum(transaction_row.amount_idr)::bigint as total_amount_idr
    from public.transactions as transaction_row
    where transaction_row.transaction_date >= p_week_start
      and transaction_row.transaction_date < p_week_start + 7
    group by transaction_row.user_id
  ),
  previous_totals as (
    select
      transaction_row.user_id,
      sum(transaction_row.amount_idr)::bigint as total_amount_idr
    from public.transactions as transaction_row
    where transaction_row.transaction_date >= p_week_start - 7
      and transaction_row.transaction_date < p_week_start
    group by transaction_row.user_id
  ),
  category_amounts as (
    select
      transaction_row.user_id,
      category.name as category_name,
      sum(transaction_row.amount_idr)::bigint as amount_idr
    from public.transactions as transaction_row
    join public.categories as category
      on category.id = transaction_row.category_id
    where transaction_row.transaction_date >= p_week_start
      and transaction_row.transaction_date < p_week_start + 7
    group by transaction_row.user_id, category.id, category.name
  ),
  category_json as (
    select
      category_amount.user_id,
      jsonb_agg(
        jsonb_build_object(
          'name', category_amount.category_name,
          'amountIdr', category_amount.amount_idr
        )
        order by category_amount.amount_idr desc, category_amount.category_name
      ) as category_totals
    from category_amounts as category_amount
    group by category_amount.user_id
  ),
  top_categories as (
    select distinct on (category_amount.user_id)
      category_amount.user_id,
      category_amount.category_name,
      category_amount.amount_idr
    from category_amounts as category_amount
    order by
      category_amount.user_id,
      category_amount.amount_idr desc,
      category_amount.category_name
  )
  select
    current_total.user_id,
    p_week_start,
    p_week_start + 6,
    current_total.transaction_count,
    current_total.total_amount_idr,
    coalesce(previous_total.total_amount_idr, 0)::bigint,
    top_category.category_name,
    top_category.amount_idr,
    category_json.category_totals
  from current_totals as current_total
  left join previous_totals as previous_total
    on previous_total.user_id = current_total.user_id
  join top_categories as top_category
    on top_category.user_id = current_total.user_id
  join category_json
    on category_json.user_id = current_total.user_id
  order by current_total.user_id;
end;
$$;

revoke all on function public.get_weekly_insight_candidates(date)
from public, anon, authenticated;
grant execute on function public.get_weekly_insight_candidates(date)
to service_role;

comment on function public.get_weekly_insight_candidates(date) is
  'Privileged aggregate-only input for F1-CP9 weekly insight generation. It returns no merchant, note, item, or receipt content.';
