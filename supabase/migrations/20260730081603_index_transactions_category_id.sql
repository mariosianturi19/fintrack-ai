-- Cover the category foreign key independently.
--
-- The existing (user_id, category_id, transaction_date) index is optimized
-- for owner-scoped category aggregation, but PostgreSQL cannot use it for
-- lookups that begin with category_id alone.

create index transactions_category_id_idx
on public.transactions (category_id);
