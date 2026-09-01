# Fintrack AI Supabase

This directory is the reproducible database source for Fintrack AI. The
development Supabase project is always updated before production, and the
project owner runs Dashboard changes manually.

## Structure

```text
supabase/
├── migrations/
│   ├── 20260730073403_create_fintrack_core_schema.sql
│   ├── 20260730081603_index_transactions_category_id.sql
│   ├── 20260815172740_f1_cp8_receipt_ai.sql
│   ├── 20260818202019_f1_cp9_weekly_insights.sql
│   └── 20260827100000_f1_cp10_account_deletion.sql
└── tests/
    ├── f1_cp4_schema_verification.sql
    ├── f1_cp4_cross_user_isolation.sql
    ├── f1_cp8_schema_verification.sql
    ├── f1_cp8_rate_limit_isolation.sql
    ├── f1_cp9_schema_verification.sql
    ├── f1_cp9_weekly_insight_isolation.sql
    ├── f1_cp9_qa_cleanup.sql
    ├── f1_cp10_schema_verification.sql
    └── f1_cp10_deletion_isolation.sql
```

The original CP4 migrations were created with Supabase CLI `2.110.0` using:

```powershell
npx --yes supabase@2.110.0 migration new create_fintrack_core_schema
npx --yes supabase@2.110.0 migration new index_transactions_category_id
```

## F1-CP4 data contract

- `categories` is a shared system catalog. Authenticated users can read the
  catalog but cannot create, edit, or delete it through the Data API. Inactive
  rows stay readable so historical transactions keep their category label.
- `transactions` belongs to exactly one `auth.users` row. RLS protects every
  CRUD operation.
- `weekly_insights` stores one generated summary per user and ISO week. RLS
  uses the same ownership boundary.
- Deleting an Auth user cascades to transactions and weekly insights.
- Receipt references store only private Cloudflare R2 object keys under
  `receipts/{user_id}/`; public and signed URLs do not belong in the database.
- Receipt line items store reviewed structured data. Raw Gemini responses are
  intentionally not retained.

## Historical F1-CP4 development workflow

This workflow was completed for CP4. Do not repeat it on the finalized CP10
database: its older isolation fixture predates the required live-session claim.

1. Open the development Supabase project.
2. Run unapplied migrations in timestamp order, each in a new SQL Editor
   query.
3. Never rerun a migration that has already completed.
4. Run `tests/f1_cp4_schema_verification.sql`.
5. After two Google test accounts have signed in once, run
   `tests/f1_cp4_cross_user_isolation.sql`.
6. Check both Security Advisor and Performance Advisor.
7. Record the results in `docs/checkpoints/F1-CP4.md`.

Do not run the migration against the production project until F1-CP4 is final
in development. Do not copy database passwords or secret/service-role keys
into chat or committed files.

## Latest completed checkpoint: F1-CP10 — FINAL

The owner completed the following sequence on `fintrack-ai-dev` and finalized
CP10 on 2026-08-27. Migrations remain immutable history; do not rerun an applied
migration or repeat completed destructive QA:

1. `migrations/20260827100000_f1_cp10_account_deletion.sql`
2. `tests/f1_cp10_schema_verification.sql` (read-only)
3. `tests/f1_cp10_deletion_isolation.sql` (synthetic fixtures, always rollback)

The new migration adds private-operation tables, restrictive active-session
RLS, write/storage barriers, service-only deletion RPCs, and excludes deleting
accounts from scheduled insight candidates. The deletion queue deliberately
survives Auth deletion; do not manually remove it while cleanup is pending.

The app now requires an actual live Auth session, including `session_id`.
Older CP4/CP8/CP9 SQL isolation scripts are historical fixtures that do not
construct live session claims; do not repeat them as CP10 QA. The current suite
tests the stronger boundary and does not target existing Google accounts.

Local `npm test` executes migration history and the CP10 scripts in PGlite with
a synthetic Auth schema. Separately, the owner reported successful remote
schema/isolation checks, second-account deletion and Auth/R2 cleanup, main
account preservation, six zero email/orphan/queue counts, and a clean console.
The original unresolved-UUID verification query was not a pass; the revised
query's different coverage is recorded in `docs/checkpoints/F1-CP10.md`.

`docs/setup/F1-CP10_ACCOUNT_DELETION.md` is a completed reference. Next is
Production Launch with separate production resources; no production migration
or deployment has been performed as part of finalizing CP10.

## Production launch — owner setup in progress

On 2026-08-28 the owner confirmed the Singapore replacement `fintrack-ai-prod`
ready (`prod Singapore siap`), then reported `Success. No rows returned` for all
five migrations. Do not repeat project creation or successful migrations, apply
them to Tokyo, or alter `fintrack-ai-dev`. The owner then reported
`Success. No rows returned` for the read-only
`supabase/tests/f1_cp10_schema_verification.sql` on Singapore the same day.
The owner supplied the production Google callback on 2026-08-28:
`https://ybdqyflzurljztfalqwu.supabase.co/auth/v1/callback`.
Production reference `ybdqyflzurljztfalqwu` is therefore known; keys are not.
The owner then confirmed `Google production aktif dan Email OFF` on 2026-08-28.
These provider settings are owner-reported; app URL configuration, successful
production login, and separate signup-setting confirmation remain pending.
The owner also confirmed the production R2 bucket private with a one-day pending
lifecycle and created a production token; scope and runtime remain unverified.
The owner also reported creating the Gemini production key; it remains untested.
The GitHub target is `https://github.com/mariosianturi19/fintrack-ai.git`.
The owner chose to perform Git authentication, staged review, first commit, and
push himself after Codex's local preflight. Follow
[the owner-run Git guide](../docs/setup/GITHUB_FIRST_PUSH.md); the previous
non-interactive remote check could not authenticate. Codex has not committed or
pushed, and local gate results do not establish production integration readiness.
See the launch checklist and credential-handling caveat. R2 CORS awaits the
real HTTPS application origin. Do not request secrets or alter dev settings; the owner enters
credentials directly in service dashboards. Do not repeat completed SQL/provider
setup merely because integration QA is still pending.
The opening dev comment in the schema query does not change its metadata-only
behavior. Older CP4/8/9 schema scripts assert pre-CP10 policy counts; do not use
them against the final schema. The CP10 isolation script is development-only,
not part of this production section.
See `docs/checkpoints/PRODUCTION-LAUNCH.md` for current instructions and evidence.

A focused local rerun of `tests/account-deletion-sql.test.ts` passed both tests
after replaying all five migrations. It includes CP10 schema assertions and
rollback-only isolation against synthetic Auth. The remote schema result is
owner-reported separately; production integration and Auth-flow QA remain pending.

## Rollback

The rollback decision and exact object order are documented in
`ROLLBACK.md`. In a database that already contains valuable data, prefer a
forward corrective migration over dropping tables.
