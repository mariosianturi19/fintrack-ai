-- F1-CP9 read-only schema verification.
-- Run in Supabase SQL Editor after the F1-CP9 migration.

do $$
begin
  if exists (
    select required_column.name
    from (
      values
        ('transaction_count'),
        ('total_amount_idr'),
        ('previous_total_amount_idr'),
        ('top_category_name'),
        ('top_category_amount_idr')
    ) as required_column(name)
    where not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'weekly_insights'
        and column_name = required_column.name
    )
  ) then
    raise exception 'One or more F1-CP9 deterministic fact columns are missing.';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'weekly_insights'
  ) <> 1 then
    raise exception 'weekly_insights must expose exactly one owner-scoped SELECT policy.';
  end if;

  if not has_table_privilege('authenticated', 'public.weekly_insights', 'SELECT')
    or has_table_privilege('authenticated', 'public.weekly_insights', 'INSERT')
    or has_table_privilege('authenticated', 'public.weekly_insights', 'UPDATE')
    or has_table_privilege('authenticated', 'public.weekly_insights', 'DELETE')
    or not has_table_privilege('service_role', 'public.weekly_insights', 'SELECT')
    or not has_table_privilege('service_role', 'public.weekly_insights', 'INSERT')
    or not has_table_privilege('service_role', 'public.weekly_insights', 'UPDATE')
    or not has_table_privilege('service_role', 'public.weekly_insights', 'DELETE')
  then
    raise exception 'weekly_insights grants do not match the read-only user contract.';
  end if;

  if not exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'get_weekly_insight_candidates'
      and not pg_proc.prosecdef
      and exists (
        select 1
        from unnest(pg_proc.proconfig) as setting
        where split_part(setting, '=', 1) = 'search_path'
          and replace(split_part(setting, '=', 2), '"', '') = ''
      )
  ) then
    raise exception 'Insight RPC must exist as SECURITY INVOKER with an empty search_path.';
  end if;

  if has_function_privilege('anon', 'public.get_weekly_insight_candidates(date)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.get_weekly_insight_candidates(date)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.get_weekly_insight_candidates(date)', 'EXECUTE')
  then
    raise exception 'Insight RPC execute grants are incorrect.';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'transactions_date_user_insight_idx'
  ) then
    raise exception 'F1-CP9 aggregate covering index is missing.';
  end if;

  raise notice 'F1-CP9 PASS: fact columns, read-only RLS, privileged RPC, and aggregate index are present.';
end;
$$;
