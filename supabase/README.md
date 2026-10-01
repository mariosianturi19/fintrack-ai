# Fintrack AI Supabase

This directory is the reproducible PostgreSQL source for Fintrack AI. Apply
migrations to the separate development project first, verify them there, and
only promote the same files to production after the application and rollback
path are ready.

## Structure

```text
supabase/
├── migrations/
│   ├── 20260730073403_create_fintrack_core_schema.sql
│   ├── 20260730081603_index_transactions_category_id.sql
│   ├── 20260815172740_f1_cp8_receipt_ai.sql
│   ├── 20260818202019_f1_cp9_weekly_insights.sql
│   ├── 20260827100000_f1_cp10_account_deletion.sql
│   ├── 20260926090000_phase2.sql
│   ├── 20261001090000_phase3_multi_wallets.sql
│   ├── 20261001130000_phase3_user_managed_wallets.sql
│   ├── 20261001210000_phase3_global_budgets.sql
│   └── 20261001230000_phase3_wallet_types.sql
└── tests/
    ├── f1_cp10_schema_verification.sql
    ├── f1_cp10_deletion_isolation.sql
    ├── f2_schema_verification.sql
    ├── f3_wallet_schema_verification.sql
    └── f3_wallet_isolation.sql
```

Older Phase 1 SQL checks remain as historical verification assets. The current
local PGlite suite replays the complete migration history and runs the latest
account-deletion and wallet isolation contracts.

## Current data contract

- `categories` is a shared, read-only system catalog for authenticated users.
- `transactions`, budgets, insights, AI request events, and wallets are
  owner-scoped through RLS and explicit application filters.
- New accounts start without a wallet. Wallets are created, named, and typed by
  the user; there is no default, automatic assignment, archive state, or preset
  account list.
- Wallet type is required for new rows and limited to `bank`, `e_wallet`,
  `cash`, or `other`. Existing migration wallets are backfilled to `other`
  because their real type cannot be inferred safely from a name.
- Existing transactions remain attached to their migration wallet, which
  becomes an ordinary renamable and deletable wallet after the corrective
  migration.
- `transactions.wallet_id` participates in a composite owner foreign key so a
  row cannot reference another user's wallet. Category budgets remain one
  owner-scoped limit per category and month across every wallet.
- Deleting a wallet permanently cascades its transactions while preserving
  account-wide budgets. The application removes matching private receipt
  objects first, and the deletion RPC clears persisted insights that are no
  longer valid.
- Full Auth-account deletion still cascades through wallets and dependent rows.
- Receipt references store only private Cloudflare R2 object keys under
  `receipts/{user_id}/`; raw Gemini responses and signed URLs are not persisted.

## Phase 3 development-first rollout

The owner should run these steps in the `fintrack-ai-dev` Supabase project,
never production first:

1. Apply `migrations/20261001090000_phase3_multi_wallets.sql` once.
2. Apply `migrations/20261001130000_phase3_user_managed_wallets.sql` once.
3. Apply `migrations/20261001210000_phase3_global_budgets.sql` once.
4. Apply `migrations/20261001230000_phase3_wallet_types.sql` once.
5. Run the read-only `tests/f3_wallet_schema_verification.sql`.
6. Run `tests/f3_wallet_isolation.sql`; it creates only synthetic fixtures and
   always rolls them back.
7. Confirm existing transaction data remains available in an ordinary wallet,
   choose its real type from Profile, verify new wallets require an explicit
   type, and confirm Budget totals still cover every wallet.
8. Promote all four migrations to production only after development QA and the
   matching application deployment are ready.

The development project already has the first three Phase 3 migrations and
their updated verification passed. For the current correction, apply only
`20261001230000_phase3_wallet_types.sql` there; do not rerun successful
migrations.

Never rerun a successful migration, paste service-role/database credentials
into SQL files, or use real accounts in isolation fixtures.

## Local verification

```powershell
npm test
```

The automated suite uses PGlite with a synthetic Auth schema. A local pass
validates PostgreSQL syntax, triggers, RLS contracts, and rollback-only fixtures;
it does not prove that either remote Supabase project has been migrated.

## Rollback

The historical Phase 1 destructive rollback is documented in
[ROLLBACK.md](./ROLLBACK.md) and must not be used on the current schema. For a
database containing valuable data, prefer a reviewed forward corrective
migration over dropping wallet or transaction structures.
