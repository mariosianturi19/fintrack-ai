# Fintrack AI — Project Progress

Last updated: October 1, 2026

## Current status

**Phase 1 and the initial Phase 2 application are deployed in production.** The application supports Google authentication, owner-isolated
transaction management, private receipt processing, reviewable AI extraction,
dashboard insights, exports, scheduled operations, PWA foundations, and account
deletion.

Phase 2 adds transaction discovery, monthly category budgets, completed-month
insights, and aggregate-only natural-language questions. Its consolidated
migration is applied and schema-verified in both development and production,
and the full automated repository gate passes. The transaction-filter and
budget-form reset fixes are deployed and production-verified. The authenticated
production maintenance route also completes successfully with the corrected R2
account endpoint. Phase 2 is complete for the current portfolio scope; broader
device, multi-account, and long-running availability checks remain deferred
release validation rather than missing implementation.

Phase 3 multi-wallet organization is implemented in the local workspace. It
keeps **Semua dompet** as the default view, adds an explicit URL-backed wallet
scope to Dashboard, Transactions, and Q&A, requires a destination wallet for
manual and receipt transactions, and manages user-created, explicitly typed
payment sources from Profile. Budget remains one account-wide plan across every
wallet. There is no default wallet, automatic selection, archive state, or
preset wallet list.
Permanent wallet deletion includes transactions, private receipt objects, and
stale persisted insights while preserving budgets. The base,
user-managed-wallet, and global-budget migrations passed development
verification. The final wallet-type migration is ready locally and awaits
development application. Phase 3 is not yet part of the live deployment.

The live deployment is available at
[fintrack-ai-sigma-two.vercel.app](https://fintrack-ai-sigma-two.vercel.app).
This is a non-commercial personal project and does not claim broad public scale
or an independent third-party security audit.

## Phase 1 milestones

| Checkpoint | Capability                                                        | Status   |
| ---------- | ----------------------------------------------------------------- | -------- |
| F1-CP1     | Project foundation, tooling, and baseline quality gates           | Complete |
| F1-CP2     | Responsive application shell and PWA foundation                   | Complete |
| F1-CP3     | Supabase foundation and Google authentication                     | Complete |
| F1-CP4     | PostgreSQL schema, indexes, and Row Level Security                | Complete |
| F1-CP5     | Manual transaction create, read, update, and delete flows         | Complete |
| F1-CP6     | Dashboard, category chart, CSV export, and XLSX export            | Complete |
| F1-CP7     | Receipt capture, image compression, and private R2 storage        | Complete |
| F1-CP8     | Gemini receipt extraction and editable review workflow            | Complete |
| F1-CP9     | Weekly insights, deterministic fallback, and scheduled operations | Complete |
| F1-CP10    | Durable account and data deletion                                 | Complete |

## Phase 2 implementation

| Capability                                         | Implementation | Verification                                               |
| -------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| Transaction search and category/date filters       | Deployed       | Production search/filter/empty/reset QA passed             |
| Monthly category budgets and in-app thresholds     | Deployed       | Production CRUD/reset QA passed and data cleaned           |
| Completed-month insight and deterministic fallback | Deployed       | Dev generation/idempotency passed; production cron passed  |
| Aggregate financial Q&A with bounded periods       | Deployed       | Production aggregate answer passed                         |
| Phase 2 account-deletion cascade coverage          | Deployed       | Disposable-user cascade passed; live RLS isolation pending |

The Phase 2 production schema, application deployment, core owner smoke flows,
and authenticated scheduled route are verified. The latest production cron had
no eligible completed-month transaction data, so no monthly-insight row was
expected. Extended responsive, multi-account, quota, and repeated-cycle checks
are intentionally deferred and do not block the current portfolio release.

## Phase 3 multi-wallet implementation

| Capability                                                    | Local implementation | Release state                            |
| ------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| Default Semua dompet plus explicit URL scope                  | Complete             | Awaiting corrected deployment            |
| User-created owner-scoped wallets without defaults or presets | Complete             | Development verification passed          |
| Explicit Bank, E-wallet, Tunai, or Lainnya wallet type        | Complete locally     | Forward dev migration and QA pending     |
| Explicit manual/receipt wallet choice and reassignment        | Complete             | Awaiting deployment                      |
| Account-wide budget across all payment-source wallets         | Complete             | Development verification passed          |
| Wallet-aware Dashboard and aggregate Q&A                      | Complete             | Awaiting deployment                      |
| All-wallet CSV/XLSX export with Dompet column                 | Complete             | Awaiting deployment                      |
| Permanent wallet transaction/receipt/insight deletion         | Corrected locally    | Global-budget preservation QA pending    |
| PostgreSQL schema, RLS, owner isolation, and delete cascade   | Complete locally     | Updated development SQL verification due |

Weekly and monthly persisted insights deliberately remain all-wallet summaries.
This avoids multiplying scheduled Gemini requests and is disclosed whenever a
specific wallet is selected. Phase 3 does not introduce balances, income,
transfers, payments, bank synchronization, or investment tracking.

## Verification snapshot

The current repository quality gate includes:

- ESLint with zero warnings;
- TypeScript compilation without emitted output;
- Prettier formatting verification;
- a production Next.js build; and
- **211 automated tests across 20 test files** using Vitest and PGlite.

The October 1 Phase 3 implementation and its user-managed-wallet,
global-budget, and wallet-type corrections pass all 211 tests, ESLint,
Prettier, the full TypeScript check, dedicated PostgreSQL/PGlite migration and
isolation checks, and an optimized production build. The wallet-type migration
still awaits application to the development project. Phase 3 deployment
remains pending.

The same day, the consolidated Phase 2 migration was applied to
`fintrack-ai-prod`. The production verification query returned `F2 schema PASS`
for budgets, monthly insights, transaction search, aggregate Q&A, grants, and
RLS.

## Phase 2 development QA — September 30, 2026

- Aggregate Q&A passed twice. The primary model returned malformed structured
  output, the validated `gemini-3.5-flash-lite` fallback ran automatically, and
  both requests completed with HTTP 200 and correct aggregate totals.
- Transaction discovery passed merchant search, date-range filtering, and a
  combined search/category/date filter against four owner-scoped QA rows.
- The August monthly insight was created once with the deterministic fallback,
  rendered the expected total, category distribution, transaction count, and
  peak day, and was skipped rather than duplicated on a second cron run.
- The September budget overview passed create, update, 80%, and 100% mutation
  checks. Temporary rows were removed and the original Rp30.000 zero-spend
  state was restored. The new delete-confirmation dialog passed copy, initial
  focus, cancel, and focus-return checks; its final destructive submit was
  reserved for a disposable production budget and later passed.
- The development R2 credential was rotated to an object read/write token scoped
  only to `fintrack-ai-dev-receipts`. A direct bucket-list request passed, and
  the combined authenticated cron completed with HTTP 200, zero deletion or
  receipt-cleanup failures, and an idempotent monthly-insight skip.
- A disposable development Auth user proved that `category_budgets` and
  `monthly_insights` cascade to zero rows after Auth deletion. Live two-account
  RLS isolation remains pending because the intentionally disabled Email
  provider prevents password login for disposable QA users.

## Phase 2 production smoke QA — September 30–October 1, 2026

- Authentication guards preserved the requested destination for Dashboard,
  Transactions, Budget, and Monthly Insight routes.
- Transaction search, category filtering, keyboard submission, reset results,
  and the no-results state passed against the existing owner-scoped production
  transaction. On October 1, commit `be23ff7` was production-verified: Reset
  cleared the search field, restored `Semua kategori`, removed the query string,
  and displayed the transaction again.
- A disposable `Lainnya` budget passed create at Rp12.345, update to Rp15.000,
  explicit confirmation, and deletion. The production account returned to Rp0
  total budget. On October 1, the post-deployment regression repeated a
  disposable Rp12.345 create/delete cycle and verified that the amount field
  returned empty after deletion. No temporary budget remained.
- Aggregate Q&A returned the correct Rp12.345 total and Makanan & minuman top
  category for the bounded 12-month period without browser errors.
- The Monthly Insight route rendered its safe empty state. The authenticated
  production cron completed with HTTP 200 after the R2 configuration was
  corrected to the account-level S3 endpoint. Its R2 listing and maintenance
  cursor update succeeded without cleanup errors. No insight was generated
  because the account had no eligible transaction in the last completed month.

The automated suite covers authentication boundaries, owner isolation,
transaction validation, dashboard aggregation, exports, private receipt
storage, AI review behavior, weekly insights, environment validation, and
account deletion. SQL assertions under `supabase/tests/` add schema and
cross-user isolation checks.

The September 26 maintenance pass also updates the patched Next.js and Sharp
dependency baseline, keeps the static offline fallback outside the authenticated
session gate, and invalidates the previous service-worker static cache.

Focused production smoke checks have covered:

- Google sign-in, session refresh, logout protection, and sign-in again;
- manual transaction creation and dashboard updates;
- CSV and XLSX downloads;
- receipt upload, private preview, AI extraction, and recovery after a transient
  provider timeout; and
- account deletion isolation, database cleanup, authentication removal, and
  private-object cleanup.

## Release boundaries

The deployed Phase 1 and Phase 2 product is suitable for portfolio
demonstration and controlled personal use. The following optional validation is
deferred until stronger availability or scale claims are needed:

- repeat receipt-analysis checks under variable provider latency;
- an end-to-end receipt save, refresh, private preview, permanent-object, and
  pending-object cleanup pass on the current production deployment;
- production evidence for scheduled execution over multiple weekly cycles;
- physical-device installation and offline-fallback checks across supported
  mobile platforms; and
- a limited-user feedback cycle.

These items are release validation, not missing Phase 1 feature implementation.

## Documentation

- [README](./README.md) — public project overview and local setup
- [Product brief](./project-brief-fintrack-ai.md) — scope, journeys, and product
  decisions
- [Design system](./DESIGN_SYSTEM.md) — visual and interaction contract
- [Database migrations](./supabase/migrations) — reproducible schema changes
- [SQL verification](./supabase/tests) — database and isolation assertions
