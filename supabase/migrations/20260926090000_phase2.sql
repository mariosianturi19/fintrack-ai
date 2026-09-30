begin;

alter table public.transactions
  add column search_text text generated always as (
    btrim(coalesce(merchant, '') || ' ' || coalesce(notes, ''))
  ) stored;

comment on column public.transactions.search_text is
  'Server-filterable merchant and note text. It inherits transaction RLS and is never sent to Gemini.';

create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  month_start date not null,
  limit_amount_idr bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint category_budgets_user_category_month_unique
    unique (user_id, category_id, month_start),
  constraint category_budgets_month_start_check
    check (extract(day from month_start) = 1),
  constraint category_budgets_limit_amount_idr_check
    check (limit_amount_idr between 1 and 999999999999)
);

comment on table public.category_budgets is
  'Owner-scoped monthly spending limits per system category.';
comment on column public.category_budgets.month_start is
  'First calendar day of the represented Jakarta month.';

create trigger category_budgets_set_updated_at
before update on public.category_budgets
for each row execute function private.set_updated_at();

create trigger category_budgets_account_write_guard
before insert or update on public.category_budgets
for each row execute function private.guard_account_write();

create index category_budgets_user_month_idx
on public.category_budgets (user_id, month_start, category_id);

alter table public.category_budgets enable row level security;
revoke all on table public.category_budgets from public, anon, authenticated;
grant select, insert, update, delete on table public.category_budgets
to authenticated, service_role;

create policy "Users can read their own category budgets"
on public.category_budgets for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own category budgets"
on public.category_budgets for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own category budgets"
on public.category_budgets for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own category budgets"
on public.category_budgets for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Active account required"
on public.category_budgets as restrictive for all to authenticated
using ((select public.get_account_access_state()) = 'active')
with check ((select public.get_account_access_state()) = 'active');

create table public.monthly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_start date not null,
  summary text not null,
  model_name text not null,
  transaction_count integer not null default 0,
  total_amount_idr bigint not null default 0,
  previous_total_amount_idr bigint not null default 0,
  top_category_name text,
  top_category_amount_idr bigint,
  peak_spending_date date,
  peak_spending_amount_idr bigint,
  category_totals jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint monthly_insights_user_month_unique unique (user_id, month_start),
  constraint monthly_insights_month_start_check
    check (extract(day from month_start) = 1),
  constraint monthly_insights_summary_format_check
    check (summary = btrim(summary) and char_length(summary) between 1 and 2400),
  constraint monthly_insights_model_name_format_check
    check (model_name = btrim(model_name) and char_length(model_name) between 1 and 100),
  constraint monthly_insights_transaction_count_check check (transaction_count >= 0),
  constraint monthly_insights_total_amount_idr_check check (total_amount_idr >= 0),
  constraint monthly_insights_previous_total_amount_idr_check check (previous_total_amount_idr >= 0),
  constraint monthly_insights_top_category_name_check
    check (top_category_name is null or (
      top_category_name = btrim(top_category_name)
      and char_length(top_category_name) between 1 and 64
    )),
  constraint monthly_insights_top_category_amount_check
    check (top_category_amount_idr is null or (
      top_category_amount_idr > 0 and top_category_amount_idr <= total_amount_idr
    )),
  constraint monthly_insights_top_category_pair_check
    check ((top_category_name is null) = (top_category_amount_idr is null)),
  constraint monthly_insights_peak_amount_check
    check (peak_spending_amount_idr is null or (
      peak_spending_amount_idr > 0 and peak_spending_amount_idr <= total_amount_idr
    )),
  constraint monthly_insights_peak_pair_check
    check ((peak_spending_date is null) = (peak_spending_amount_idr is null)),
  constraint monthly_insights_category_totals_type_check
    check (jsonb_typeof(category_totals) = 'array'),
  constraint monthly_insights_category_totals_size_check
    check (octet_length(category_totals::text) <= 16384)
);

comment on table public.monthly_insights is
  'Persisted completed-month summaries with deterministic financial facts and an optional AI narrative.';

create trigger monthly_insights_set_updated_at
before update on public.monthly_insights
for each row execute function private.set_updated_at();

create trigger monthly_insights_account_write_guard
before insert or update on public.monthly_insights
for each row execute function private.guard_account_write();

create index monthly_insights_user_month_idx
on public.monthly_insights (user_id, month_start desc);

alter table public.monthly_insights enable row level security;
revoke all on table public.monthly_insights from public, anon, authenticated;
grant select on table public.monthly_insights to authenticated;
grant select, insert, update, delete on table public.monthly_insights to service_role;

create policy "Users can read their own monthly insights"
on public.monthly_insights for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Active account required"
on public.monthly_insights as restrictive for all to authenticated
using ((select public.get_account_access_state()) = 'active')
with check ((select public.get_account_access_state()) = 'active');

create or replace function public.get_monthly_insight_candidates(p_month_start date)
returns table (
  user_id uuid,
  month_start date,
  month_end date,
  transaction_count integer,
  total_amount_idr bigint,
  previous_total_amount_idr bigint,
  top_category_name text,
  top_category_amount_idr bigint,
  peak_spending_date date,
  peak_spending_amount_idr bigint,
  category_totals jsonb
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_month_start is null or extract(day from p_month_start) <> 1 then
    raise exception 'p_month_start must be the first day of a month'
      using errcode = '22023';
  end if;

  return query
  with current_transactions as (
    select transaction_row.*
    from public.transactions as transaction_row
    where transaction_row.transaction_date >= p_month_start
      and transaction_row.transaction_date < p_month_start + interval '1 month'
      and not exists (
        select 1 from public.account_deletion_requests as deletion
        where deletion.user_id = transaction_row.user_id
      )
  ),
  current_totals as (
    select transaction_row.user_id,
      count(*)::integer as transaction_count,
      sum(transaction_row.amount_idr)::bigint as total_amount_idr
    from current_transactions as transaction_row
    group by transaction_row.user_id
  ),
  previous_totals as (
    select transaction_row.user_id,
      sum(transaction_row.amount_idr)::bigint as total_amount_idr
    from public.transactions as transaction_row
    where transaction_row.transaction_date >= (p_month_start - interval '1 month')::date
      and transaction_row.transaction_date < p_month_start
    group by transaction_row.user_id
  ),
  category_amounts as (
    select transaction_row.user_id, category.name,
      sum(transaction_row.amount_idr)::bigint as amount_idr
    from current_transactions as transaction_row
    join public.categories as category on category.id = transaction_row.category_id
    group by transaction_row.user_id, category.id, category.name
  ),
  category_json as (
    select category_amount.user_id,
      jsonb_agg(jsonb_build_object(
        'name', category_amount.name,
        'amountIdr', category_amount.amount_idr
      ) order by category_amount.amount_idr desc, category_amount.name) as totals
    from category_amounts as category_amount
    group by category_amount.user_id
  ),
  top_categories as (
    select distinct on (category_amount.user_id)
      category_amount.user_id, category_amount.name, category_amount.amount_idr
    from category_amounts as category_amount
    order by category_amount.user_id, category_amount.amount_idr desc, category_amount.name
  ),
  daily_amounts as (
    select transaction_row.user_id, transaction_row.transaction_date,
      sum(transaction_row.amount_idr)::bigint as amount_idr
    from current_transactions as transaction_row
    group by transaction_row.user_id, transaction_row.transaction_date
  ),
  peak_days as (
    select distinct on (daily_amount.user_id)
      daily_amount.user_id, daily_amount.transaction_date, daily_amount.amount_idr
    from daily_amounts as daily_amount
    order by daily_amount.user_id, daily_amount.amount_idr desc, daily_amount.transaction_date
  )
  select current_total.user_id,
    p_month_start,
    (p_month_start + interval '1 month - 1 day')::date,
    current_total.transaction_count,
    current_total.total_amount_idr,
    coalesce(previous_total.total_amount_idr, 0)::bigint,
    top_category.name,
    top_category.amount_idr,
    peak_day.transaction_date,
    peak_day.amount_idr,
    category_json.totals
  from current_totals as current_total
  left join previous_totals as previous_total on previous_total.user_id = current_total.user_id
  join top_categories as top_category on top_category.user_id = current_total.user_id
  join peak_days as peak_day on peak_day.user_id = current_total.user_id
  join category_json on category_json.user_id = current_total.user_id
  order by current_total.user_id;
end;
$$;

revoke all on function public.get_monthly_insight_candidates(date)
from public, anon, authenticated;
grant execute on function public.get_monthly_insight_candidates(date) to service_role;

comment on function public.get_monthly_insight_candidates(date) is
  'Privileged aggregate-only input for completed monthly insights. Merchant, note, receipt item, and receipt image data are excluded.';

create or replace function public.get_category_spending(
  p_start_date date,
  p_end_date date
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

  return query
  select transaction_row.category_id,
    count(*)::integer,
    sum(transaction_row.amount_idr)::bigint
  from public.transactions as transaction_row
  where transaction_row.user_id = v_user_id
    and transaction_row.transaction_date between p_start_date and p_end_date
  group by transaction_row.category_id;
end;
$$;

revoke all on function public.get_category_spending(date, date)
from public, anon;
grant execute on function public.get_category_spending(date, date)
to authenticated;

alter table public.ai_request_events
  drop constraint ai_request_events_feature_check;
alter table public.ai_request_events
  add constraint ai_request_events_feature_check
  check (feature in ('receipt_extraction', 'finance_question'));

create index ai_request_events_feature_created_idx
on public.ai_request_events (feature, created_at desc);

create or replace function public.consume_finance_question_quota(p_request_id uuid)
returns table (accepted boolean, reason text, retry_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_day_start timestamptz;
  v_minute_count integer;
  v_minute_first timestamptz;
  v_user_day_count integer;
  v_global_day_count integer;
begin
  if v_user_id is null or public.get_account_access_state() <> 'active' then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('finance_question', 481204)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 481205)
  );

  if exists (
    select 1 from public.ai_request_events
    where user_id = v_user_id and request_id = p_request_id
  ) then
    return query select false, 'duplicate'::text, null::timestamptz;
    return;
  end if;

  select count(*)::integer, min(created_at)
  into v_minute_count, v_minute_first
  from public.ai_request_events
  where user_id = v_user_id
    and feature = 'finance_question'
    and created_at > v_now - interval '1 minute';

  if v_minute_count >= 3 then
    return query select false, 'minute'::text, v_minute_first + interval '1 minute';
    return;
  end if;

  v_day_start := (
    pg_catalog.date_trunc('day', v_now at time zone 'Asia/Jakarta')
    at time zone 'Asia/Jakarta'
  );

  select count(*)::integer into v_user_day_count
  from public.ai_request_events
  where user_id = v_user_id
    and feature = 'finance_question'
    and created_at >= v_day_start;

  if v_user_day_count >= 20 then
    return query select false, 'day'::text,
      (pg_catalog.date_trunc('day', v_now at time zone 'Asia/Jakarta') + interval '1 day')
      at time zone 'Asia/Jakarta';
    return;
  end if;

  select count(*)::integer into v_global_day_count
  from public.ai_request_events
  where feature = 'finance_question' and created_at >= v_day_start;

  if v_global_day_count >= 200 then
    return query select false, 'global_day'::text,
      (pg_catalog.date_trunc('day', v_now at time zone 'Asia/Jakarta') + interval '1 day')
      at time zone 'Asia/Jakarta';
    return;
  end if;

  insert into public.ai_request_events (user_id, request_id, feature)
  values (v_user_id, p_request_id, 'finance_question');

  return query select true, 'accepted'::text, null::timestamptz;
end;
$$;

revoke all on function public.consume_finance_question_quota(uuid)
from public, anon;
grant execute on function public.consume_finance_question_quota(uuid) to authenticated;

create or replace function public.get_finance_question_context(
  p_start_date date,
  p_end_date date
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

  with period_transactions as (
    select transaction_row.transaction_date, transaction_row.amount_idr,
      transaction_row.category_id, transaction_row.merchant
    from public.transactions as transaction_row
    where transaction_row.user_id = v_user_id
      and transaction_row.transaction_date between p_start_date and p_end_date
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

revoke all on function public.get_finance_question_context(date, date)
from public, anon;
grant execute on function public.get_finance_question_context(date, date)
to authenticated;

notify pgrst, 'reload schema';
commit;
