-- Read-only assertions. Run after the CP10 migration in fintrack-ai-dev.
do $$
declare table_name text; function_name text;
begin
  foreach table_name in array array['account_deletion_requests', 'account_storage_activity', 'account_deletion_cleanup_proofs', 'maintenance_cursors'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = table_name and c.relrowsecurity) then
      raise exception 'CP10: RLS missing for %', table_name;
    end if;
    if has_table_privilege('authenticated', 'public.' || table_name, 'SELECT, INSERT, UPDATE, DELETE')
      or has_table_privilege('anon', 'public.' || table_name, 'SELECT, INSERT, UPDATE, DELETE') then
      raise exception 'CP10: internal table exposed: %', table_name;
    end if;
  end loop;
  foreach table_name in array array['transactions', 'weekly_insights', 'ai_request_events'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'Active account required' and permissive = 'RESTRICTIVE') then
      raise exception 'CP10: restrictive active-account policy missing for %', table_name;
    end if;
    if not exists (select 1 from pg_trigger where tgrelid = ('public.' || table_name)::regclass and tgname = table_name || '_account_write_guard' and tgenabled = 'O') then
      raise exception 'CP10: write barrier missing for %', table_name;
    end if;
  end loop;
  foreach function_name in array array['reserve_account_storage(uuid,text)', 'begin_account_deletion(uuid)', 'claim_account_deletion(uuid,uuid)'] loop
    if has_function_privilege('authenticated', 'public.' || function_name, 'EXECUTE')
      or has_function_privilege('anon', 'public.' || function_name, 'EXECUTE')
      or not has_function_privilege('service_role', 'public.' || function_name, 'EXECUTE') then
      raise exception 'CP10: unsafe RPC grants: %', function_name;
    end if;
  end loop;
  if not has_function_privilege('authenticated', 'public.get_account_access_state()', 'EXECUTE')
    or has_function_privilege('anon', 'public.get_account_access_state()', 'EXECUTE') then
    raise exception 'CP10: unsafe access-state RPC grants';
  end if;
  if exists (select 1 from pg_constraint where conrelid = 'public.account_deletion_requests'::regclass and contype = 'f') then
    raise exception 'CP10: recovery queue must survive Auth deletion';
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.account_storage_activity'::regclass and confrelid = 'auth.users'::regclass and confdeltype = 'c') then
    raise exception 'CP10: storage activity cascade missing';
  end if;
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.proname in ('get_account_access_state', 'guard_account_write', 'reserve_account_storage', 'begin_account_deletion')
      and (not p.prosecdef or not coalesce(p.proconfig @> array['search_path=""'], false))
  ) then raise exception 'CP10: SECURITY DEFINER configuration is unsafe'; end if;
end;
$$;
