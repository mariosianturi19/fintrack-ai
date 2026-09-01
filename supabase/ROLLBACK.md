# F1-CP4 Rollback

**Historical CP4-only instructions. Do not run this on the current CP10 schema.**
CP10 deletion jobs must survive failures until storage and Auth cleanup finish.
Do not drop the queue, guard functions, or policies as a recovery shortcut.
An accepted account deletion is irreversible; rolling back application code
does not restore deleted data. Prefer a reviewed forward corrective migration.

Use this only in the development project before any valuable transaction data
exists. These statements delete the three F1-CP4 tables and every row in them.

Before any destructive action:

1. Confirm the active Dashboard project is `fintrack-ai-dev`.
2. Confirm F1-CP4 data can be discarded.
3. Export any rows that must be preserved.

The rollback order is:

```sql
begin;

drop table if exists public.weekly_insights;
drop table if exists public.transactions;
drop table if exists public.categories;
drop function if exists private.set_updated_at();

commit;
```

The `private` schema itself is retained because later migrations may add
unrelated internal objects there.

For production or any database with real user data, do not use this rollback.
Create and review a forward migration that preserves data instead.
