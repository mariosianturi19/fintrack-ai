-- F1-CP8 read-only schema verification.
-- Run in Supabase SQL Editor after the F1-CP8 migration.

do $$
begin
  if to_regclass('public.ai_request_events') is null then
    raise exception 'Missing F1-CP8 table: public.ai_request_events.';
  end if;

  if not exists (
    select 1
    from pg_class
    where oid = 'public.ai_request_events'::regclass
      and relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.ai_request_events.';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_request_events'
  ) <> 2 then
    raise exception 'Expected two owner-scoped ai_request_events policies.';
  end if;

  if has_table_privilege('anon', 'public.ai_request_events', 'SELECT')
    or has_table_privilege('anon', 'public.ai_request_events', 'INSERT')
    or not has_table_privilege('authenticated', 'public.ai_request_events', 'SELECT')
    or not has_table_privilege('authenticated', 'public.ai_request_events', 'INSERT')
    or has_table_privilege('authenticated', 'public.ai_request_events', 'UPDATE')
    or has_table_privilege('authenticated', 'public.ai_request_events', 'DELETE')
  then
    raise exception 'F1-CP8 table grants do not match the owner request-ledger contract.';
  end if;

  if not exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'consume_receipt_ai_quota'
      and not pg_proc.prosecdef
      and exists (
        select 1
        from unnest(pg_proc.proconfig) as setting
        where split_part(setting, '=', 1) = 'search_path'
          and replace(split_part(setting, '=', 2), '"', '') = ''
      )
  ) then
    raise exception 'Quota RPC must exist as SECURITY INVOKER with an empty search_path.';
  end if;

  if has_function_privilege('anon', 'public.consume_receipt_ai_quota(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.consume_receipt_ai_quota(uuid)', 'EXECUTE')
  then
    raise exception 'Quota RPC execute grants are incorrect.';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'ai_request_events_user_feature_created_idx'
  ) or not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'transactions_receipt_object_key_unique_idx'
  ) then
    raise exception 'Required F1-CP8 indexes are missing.';
  end if;

  raise notice 'F1-CP8 PASS: request ledger, RLS, grants, invoker RPC, and idempotency indexes are present.';
end;
$$;
