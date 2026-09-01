-- F1-CP4 read-only schema verification.
--
-- Run this in the Supabase SQL Editor immediately after the core migration.
-- It does not create, update, or delete application data.

do $$
declare
  missing_table text;
begin
  select expected.table_name
  into missing_table
  from (
    values
      ('categories'),
      ('transactions'),
      ('weekly_insights')
  ) as expected(table_name)
  where to_regclass('public.' || expected.table_name) is null
  limit 1;

  if missing_table is not null then
    raise exception 'Missing F1-CP4 table: public.%', missing_table;
  end if;

  if exists (
    select 1
    from pg_class
    where oid in (
      'public.categories'::regclass,
      'public.transactions'::regclass,
      'public.weekly_insights'::regclass
    )
    and not relrowsecurity
  ) then
    raise exception 'RLS is not enabled on every F1-CP4 public table.';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
  ) <> 1 then
    raise exception 'Expected one categories RLS policy.';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
  ) <> 4 then
    raise exception 'Expected four transactions RLS policies.';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'weekly_insights'
  ) <> 4 then
    raise exception 'Expected four weekly_insights RLS policies.';
  end if;

  if (select count(*) from public.categories) <> 6 then
    raise exception 'Expected exactly six initial category rows.';
  end if;

  if has_table_privilege('anon', 'public.categories', 'SELECT')
    or has_table_privilege('anon', 'public.transactions', 'SELECT')
    or has_table_privilege('anon', 'public.transactions', 'INSERT')
    or has_table_privilege('anon', 'public.transactions', 'UPDATE')
    or has_table_privilege('anon', 'public.transactions', 'DELETE')
    or has_table_privilege('anon', 'public.weekly_insights', 'SELECT')
  then
    raise exception 'Anonymous role unexpectedly has F1-CP4 table privileges.';
  end if;

  if not has_table_privilege('authenticated', 'public.categories', 'SELECT')
    or has_table_privilege('authenticated', 'public.categories', 'INSERT')
    or has_table_privilege('authenticated', 'public.categories', 'UPDATE')
    or has_table_privilege('authenticated', 'public.categories', 'DELETE')
  then
    raise exception 'Authenticated category grants do not match the read-only contract.';
  end if;

  if not (
    has_table_privilege('authenticated', 'public.transactions', 'SELECT')
    and has_table_privilege('authenticated', 'public.transactions', 'INSERT')
    and has_table_privilege('authenticated', 'public.transactions', 'UPDATE')
    and has_table_privilege('authenticated', 'public.transactions', 'DELETE')
    and has_table_privilege('authenticated', 'public.weekly_insights', 'SELECT')
    and has_table_privilege('authenticated', 'public.weekly_insights', 'INSERT')
    and has_table_privilege('authenticated', 'public.weekly_insights', 'UPDATE')
    and has_table_privilege('authenticated', 'public.weekly_insights', 'DELETE')
  ) then
    raise exception 'Authenticated user-owned table grants are incomplete.';
  end if;

  if (
    select count(*)
    from pg_constraint
    where conrelid in (
      'public.transactions'::regclass,
      'public.weekly_insights'::regclass
    )
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'c'
  ) <> 2 then
    raise exception 'Both user-owned tables must cascade when auth.users is deleted.';
  end if;

  if not exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'private'
      and pg_proc.proname = 'set_updated_at'
      and not pg_proc.prosecdef
  ) then
    raise exception 'private.set_updated_at must exist and remain SECURITY INVOKER.';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'transactions_user_date_idx'
  ) or not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'transactions_user_category_date_idx'
  ) or not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'transactions_category_id_idx'
  ) then
    raise exception 'Required transaction and foreign-key indexes are missing.';
  end if;

  raise notice 'F1-CP4 PASS: schema, seed, grants, RLS, cascade, trigger security, and indexes are present.';
end;
$$;
