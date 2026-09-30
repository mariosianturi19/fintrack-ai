# Fintrack AI — Project Progress

Last updated: September 30, 2026

## Current status

**Phase 1 is feature-complete in production, while the full Phase 2
implementation and production schema are ready for application deployment.** The application supports Google authentication, owner-isolated
transaction management, private receipt processing, reviewable AI extraction,
dashboard insights, exports, scheduled operations, PWA foundations, and account
deletion.

Phase 2 adds transaction discovery, monthly category budgets, completed-month
insights, and aggregate-only natural-language questions. Its consolidated
migration is applied and schema-verified in both development and production,
and the full automated repository gate passes. Application deployment and
production owner QA remain pending, so Phase 2 must not yet be described as
production-verified.

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

| Capability                                         | Implementation  | Verification                                               |
| -------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| Transaction search and category/date filters       | Present locally | Dev owner QA passed                                        |
| Monthly category budgets and in-app thresholds     | Present locally | Save/update/threshold QA passed; delete submit pending     |
| Completed-month insight and deterministic fallback | Present locally | Dev generation/render/idempotency passed                   |
| Aggregate financial Q&A with bounded periods       | Present locally | Dev fallback QA passed twice                               |
| Phase 2 account-deletion cascade coverage          | Present locally | Disposable-user cascade passed; live RLS isolation pending |

The Phase 2 production schema gate is complete. Application deployment is the
next promotion step; release validation remains open until owner QA covers
responsive behavior, keyboard access, zoom, multi-account isolation, cron
idempotency, quota behavior, and deletion cleanup.

## Verification snapshot

The current repository quality gate includes:

- ESLint with zero warnings;
- TypeScript compilation without emitted output;
- Prettier formatting verification;
- a production Next.js build; and
- **197 automated tests across 19 test files** using Vitest and PGlite.

The September 30 Phase 2 repository gate passed all 197 tests, ESLint,
Prettier, the full TypeScript check, and an optimized production build.

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
  focus, cancel, and focus-return checks; its final destructive submit remains
  pending explicit owner confirmation.
- The development R2 credential was rotated to an object read/write token scoped
  only to `fintrack-ai-dev-receipts`. A direct bucket-list request passed, and
  the combined authenticated cron completed with HTTP 200, zero deletion or
  receipt-cleanup failures, and an idempotent monthly-insight skip.
- A disposable development Auth user proved that `category_budgets` and
  `monthly_insights` cascade to zero rows after Auth deletion. Live two-account
  RLS isolation remains pending because the intentionally disabled Email
  provider prevents password login for disposable QA users.

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

The deployed Phase 1 product is suitable for portfolio demonstration and
controlled personal use. The following validation remains intentionally
ongoing before making stronger availability or scale claims:

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
