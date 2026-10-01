-- Read-only Phase 3 schema verification. Run after all Phase 3 migrations.
do $$
begin
  if to_regclass('public.wallets') is null then
    raise exception 'Phase 3 table missing: public.wallets';
  end if;
  if not (
    select relation.relrowsecurity
    from pg_class as relation
    where relation.oid = 'public.wallets'::regclass
  ) then
    raise exception 'RLS is not enabled on public.wallets';
  end if;
  if exists (
    select 1 from information_schema.columns as column_row
    where column_row.table_schema = 'public'
      and column_row.table_name = 'wallets'
      and column_row.column_name in ('is_default', 'archived_at')
  ) then
    raise exception 'Deprecated default or archive wallet columns remain';
  end if;
  if not exists (
    select 1 from information_schema.columns as column_row
    where column_row.table_schema = 'public'
      and column_row.table_name = 'wallets'
      and column_row.column_name = 'wallet_type'
      and column_row.is_nullable = 'NO'
      and column_row.column_default is null
  ) then
    raise exception 'Required explicit wallet type is missing, nullable, or defaulted';
  end if;
  if not exists (
    select 1 from pg_constraint as constraint_row
    where constraint_row.conname = 'wallets_type_check'
      and pg_get_constraintdef(constraint_row.oid) like '%bank%'
      and pg_get_constraintdef(constraint_row.oid) like '%e_wallet%'
      and pg_get_constraintdef(constraint_row.oid) like '%cash%'
      and pg_get_constraintdef(constraint_row.oid) like '%other%'
  ) then
    raise exception 'Wallet type constraint is missing or incomplete';
  end if;
  if not exists (
    select 1 from information_schema.columns as column_row
    where column_row.table_schema = 'public'
      and column_row.table_name = 'transactions'
      and column_row.column_name = 'wallet_id'
      and column_row.is_nullable = 'NO'
  ) then
    raise exception 'Required transaction wallet ownership is missing or nullable';
  end if;
  if exists (
    select 1 from information_schema.columns as column_row
    where column_row.table_schema = 'public'
      and column_row.table_name = 'category_budgets'
      and column_row.column_name = 'wallet_id'
  ) then
    raise exception 'Category budgets are still scoped to wallets';
  end if;
  if not exists (
    select 1 from pg_constraint as constraint_row
    where constraint_row.conname = 'transactions_user_wallet_fkey'
      and constraint_row.confdeltype = 'c'
  ) then
    raise exception 'Transaction wallet foreign key is missing or does not cascade';
  end if;
  if not exists (
    select 1 from pg_constraint as constraint_row
    where constraint_row.conname = 'category_budgets_user_category_month_unique'
  ) or exists (
    select 1 from pg_constraint as constraint_row
    where constraint_row.conname in (
      'category_budgets_user_wallet_fkey',
      'category_budgets_user_wallet_category_month_unique'
    )
  ) then
    raise exception 'Global category budget constraints are invalid';
  end if;
  if to_regclass('public.category_budgets_user_month_idx') is null
    or to_regclass('public.category_budgets_user_wallet_month_idx') is not null
  then
    raise exception 'Global category budget index is invalid';
  end if;
  if to_regprocedure('public.get_category_spending(date,date,uuid)') is null
    or to_regprocedure('public.get_finance_question_context(date,date,uuid)') is null
    or to_regprocedure('public.get_wallet_deletion_summaries()') is null
    or to_regprocedure('public.delete_wallet_with_data(uuid)') is null
  then
    raise exception 'One or more wallet RPCs are missing';
  end if;
  if exists (
    select 1 from pg_trigger as trigger_row
    where not trigger_row.tgisinternal
      and trigger_row.tgname in (
        'auth_user_default_wallet',
        'transactions_00_assign_default_wallet',
        'category_budgets_00_assign_default_wallet',
        'transactions_active_wallet_guard',
        'category_budgets_active_wallet_guard',
        'wallets_default_guard'
      )
  ) then
    raise exception 'Deprecated wallet default or archive triggers remain';
  end if;
  if not exists (
    select 1 from pg_policies as policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'wallets'
      and policy_row.policyname = 'Users can read their own wallets'
  ) or not exists (
    select 1 from pg_policies as policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'wallets'
      and policy_row.policyname = 'Active account required'
      and policy_row.permissive = 'RESTRICTIVE'
  ) then
    raise exception 'Wallet ownership or active-account RLS policy is missing';
  end if;
  if has_table_privilege('anon', 'public.wallets', 'SELECT')
    or not has_table_privilege('authenticated', 'public.wallets', 'SELECT')
    or not has_table_privilege('authenticated', 'public.wallets', 'INSERT')
    or not has_table_privilege('authenticated', 'public.wallets', 'UPDATE')
    or not has_table_privilege('authenticated', 'public.wallets', 'DELETE')
  then
    raise exception 'Phase 3 wallet grants are invalid';
  end if;
end $$;

select 'F3 schema PASS: typed user-managed wallets, global budgets, explicit transaction references, permanent deletion, aggregate filters, grants, and RLS are present.' as result;
