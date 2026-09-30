-- Read-only Phase 2 schema verification. Run after the Phase 2 migration.
do $$
declare
  v_table_name text;
begin
  foreach v_table_name in array array['category_budgets', 'monthly_insights'] loop
    if to_regclass('public.' || v_table_name) is null then
      raise exception 'Phase 2 table missing: public.%', v_table_name;
    end if;
    if not (select relrowsecurity from pg_class where oid = ('public.' || v_table_name)::regclass) then
      raise exception 'RLS is not enabled on public.%', v_table_name;
    end if;
  end loop;

  if to_regprocedure('public.get_category_spending(date,date)') is null
    or to_regprocedure('public.get_monthly_insight_candidates(date)') is null
    or to_regprocedure('public.get_finance_question_context(date,date)') is null
    or to_regprocedure('public.consume_finance_question_quota(uuid)') is null
  then
    raise exception 'One or more Phase 2 RPCs are missing';
  end if;

  if not exists (
    select 1 from information_schema.columns as column_row
    where column_row.table_schema = 'public'
      and column_row.table_name = 'transactions'
      and column_row.column_name = 'search_text'
      and column_row.is_generated = 'ALWAYS'
  ) then
    raise exception 'Generated transaction search_text is missing';
  end if;

  if has_table_privilege('anon', 'public.category_budgets', 'SELECT')
    or has_table_privilege('anon', 'public.monthly_insights', 'SELECT')
    or not has_table_privilege('authenticated', 'public.category_budgets', 'SELECT')
    or not has_table_privilege('authenticated', 'public.monthly_insights', 'SELECT')
  then
    raise exception 'Phase 2 grants are invalid';
  end if;
end $$;

select 'F2 schema PASS: budgets, monthly insights, search, aggregate Q&A, grants, and RLS are present.' as result;
