-- F1-CP9 owner QA cleanup.
-- Removes only the four documented QA transactions and their generated insight.
-- Any unexpected row count aborts and rolls back the entire cleanup.

begin;

create temporary table f1_cp9_cleanup_target (
  user_id uuid primary key
) on commit drop;

insert into f1_cp9_cleanup_target (user_id)
select transaction_row.user_id
from public.transactions as transaction_row
where transaction_row.source = 'manual'
  and (
    (
      transaction_row.notes = 'QA CP9 pembanding'
      and transaction_row.transaction_date = date '2026-08-12'
      and transaction_row.amount_idr = 10000
    )
    or (
      transaction_row.notes = 'QA CP9 makan 1'
      and transaction_row.transaction_date = date '2026-08-18'
      and transaction_row.amount_idr = 15000
    )
    or (
      transaction_row.notes = 'QA CP9 makan 2'
      and transaction_row.transaction_date = date '2026-08-20'
      and transaction_row.amount_idr = 20000
    )
    or (
      transaction_row.notes = 'QA CP9 transport'
      and transaction_row.transaction_date = date '2026-08-22'
      and transaction_row.amount_idr = 10000
    )
  )
group by transaction_row.user_id
having count(*) = 4
  and count(
    distinct (
      transaction_row.notes,
      transaction_row.transaction_date,
      transaction_row.amount_idr
    )
  ) = 4;

do $$
declare
  target_user_count integer;
  target_transaction_count integer;
  target_insight_count integer;
begin
  select count(*)
  into target_user_count
  from f1_cp9_cleanup_target;

  if target_user_count <> 1 then
    raise exception
      'F1-CP9 cleanup aborted: expected one owner with four exact QA transactions, found %.',
      target_user_count;
  end if;

  select count(*)
  into target_transaction_count
  from public.transactions as transaction_row
  join f1_cp9_cleanup_target as target
    on target.user_id = transaction_row.user_id
  where transaction_row.source = 'manual'
    and (
      (
        transaction_row.notes = 'QA CP9 pembanding'
        and transaction_row.transaction_date = date '2026-08-12'
        and transaction_row.amount_idr = 10000
      )
      or (
        transaction_row.notes = 'QA CP9 makan 1'
        and transaction_row.transaction_date = date '2026-08-18'
        and transaction_row.amount_idr = 15000
      )
      or (
        transaction_row.notes = 'QA CP9 makan 2'
        and transaction_row.transaction_date = date '2026-08-20'
        and transaction_row.amount_idr = 20000
      )
      or (
        transaction_row.notes = 'QA CP9 transport'
        and transaction_row.transaction_date = date '2026-08-22'
        and transaction_row.amount_idr = 10000
      )
    );

  if target_transaction_count <> 4 then
    raise exception
      'F1-CP9 cleanup aborted: expected four exact QA transactions, found %.',
      target_transaction_count;
  end if;

  select count(*)
  into target_insight_count
  from public.weekly_insights as insight
  join f1_cp9_cleanup_target as target
    on target.user_id = insight.user_id
  where insight.week_start = date '2026-08-17'
    and insight.transaction_count = 3
    and insight.total_amount_idr = 45000
    and insight.previous_total_amount_idr = 10000;

  if target_insight_count <> 1 then
    raise exception
      'F1-CP9 cleanup aborted: expected one exact generated insight, found %.',
      target_insight_count;
  end if;
end;
$$;

delete from public.weekly_insights as insight
using f1_cp9_cleanup_target as target
where insight.user_id = target.user_id
  and insight.week_start = date '2026-08-17'
  and insight.transaction_count = 3
  and insight.total_amount_idr = 45000
  and insight.previous_total_amount_idr = 10000;

delete from public.transactions as transaction_row
using f1_cp9_cleanup_target as target
where transaction_row.user_id = target.user_id
  and transaction_row.source = 'manual'
  and (
    (
      transaction_row.notes = 'QA CP9 pembanding'
      and transaction_row.transaction_date = date '2026-08-12'
      and transaction_row.amount_idr = 10000
    )
    or (
      transaction_row.notes = 'QA CP9 makan 1'
      and transaction_row.transaction_date = date '2026-08-18'
      and transaction_row.amount_idr = 15000
    )
    or (
      transaction_row.notes = 'QA CP9 makan 2'
      and transaction_row.transaction_date = date '2026-08-20'
      and transaction_row.amount_idr = 20000
    )
    or (
      transaction_row.notes = 'QA CP9 transport'
      and transaction_row.transaction_date = date '2026-08-22'
      and transaction_row.amount_idr = 10000
    )
  );

commit;

select 'F1-CP9 QA cleanup PASS: 4 transactions and 1 weekly insight removed.' as result;
