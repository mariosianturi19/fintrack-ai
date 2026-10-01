# Fintrack AI — Product Brief

## Product summary

Fintrack AI is a mobile-first personal expense tracker that combines manual
transaction management with reviewable receipt extraction. It is built as a
non-commercial, full-stack software engineering portfolio project and a useful
tool for personal finance tracking.

The product is designed around one rule: **AI may assist, but the user remains
in control.** Receipt analysis produces an editable draft and never creates a
transaction without explicit confirmation.

## Problem

Personal expense tracking often fails for two reasons:

- entering every transaction manually becomes repetitive; and
- fully automated categorization can be difficult to trust when the source data
  is incomplete or ambiguous.

Fintrack AI reduces repetitive work without hiding uncertainty. It supports
fast manual entry, optional receipt extraction, visible validation, and a clear
review step before financial data is saved.

## Audience and scope

The current release is intended for individual users who want a focused way to
record expenses and inspect spending patterns. Each account has an isolated
workspace; data is never shared between users.

Phase 1 covers:

- Google authentication and automatic account registration;
- owner-scoped transaction creation, editing, deletion, pagination, and detail
  views;
- dashboard totals, category distribution, recent activity, and weekly
  insights;
- CSV and XLSX exports;
- private receipt upload, compression, verification, and preview;
- Gemini-assisted receipt extraction with an editable review form;
- installable PWA foundations and an offline fallback;
- durable account and data deletion.

Phase 2 extends the same owner-controlled workspace with:

- transaction search and filtering by category and date range;
- monthly category budgets with in-app warnings at 80% and 100%;
- completed-month insights with deterministic facts and an optional Gemini
  narrative; and
- natural-language questions over a bounded, aggregate-only view of the
  authenticated user's transactions.

Phase 3 organizes expenses across multiple wallets without modeling account
balances:

- wallets are named, typed, and created by the user as payment sources such as
  BCA (`Bank`), GoPay (`E-wallet`), or physical money (`Tunai`); new accounts
  receive no system wallet;
- Dashboard, Transactions, and Q&A default to `Semua dompet` and can be narrowed
  through an explicit `?wallet=<id>` scope;
- manual and receipt-created transactions require an explicit wallet selection
  and can be reassigned during editing;
- budgets remain one account-wide limit per category and month, calculated from
  transactions across every wallet;
- deleting a wallet permanently deletes its transactions, receipt objects, and
  stale persisted insights after explicit confirmation without deleting the
  account-wide budgets; and
- exports remain account-wide and add the wallet name as a column.

Social features, bank synchronization, payments, investment tracking, and
automated financial advice are outside the current scope. Wallets are record
groupings, not bank accounts: Phase 3 does not add balances, income, or transfers.

## Product principles

### Human-reviewed automation

AI output is treated as a suggestion. Merchant, date, category, total, notes,
and receipt line items remain editable until the user confirms the transaction.
If analysis fails, the uploaded photo and draft remain available for retry or
manual entry.

### Privacy by boundary

Financial records are owner-scoped in application queries and PostgreSQL Row
Level Security policies. Receipt images are stored in a private object bucket
and are accessed through short-lived signed operations.

### Clear system state

The interface distinguishes upload, analysis, review, save, failure, and retry
states. Destructive actions require explicit confirmation, and account deletion
has a recoverable background cleanup path.

### Calm, accessible interaction

The **Quiet Signal — Refined** design direction favors clear hierarchy,
restrained color, readable type, visible focus states, and layouts that remain
usable across mobile, desktop, keyboard navigation, and high zoom.

## Core journeys

### Record a transaction manually

1. The user opens the transaction form.
2. If no wallet exists, the application directs the user to create one first.
3. The user explicitly selects one wallet; the application never preselects a
   system or preferred destination.
4. The application validates amount, category, wallet, date, merchant, and
   optional notes.
5. The server derives ownership from the authenticated session and confirms
   that the wallet is owned by the same account.
6. The saved transaction appears in the list and scoped dashboard aggregates.

### Create a transaction from a receipt

1. The user selects a supported receipt image.
2. The browser normalizes and compresses the image before upload.
3. The server issues a short-lived, owner-scoped upload operation.
4. The server verifies the uploaded object before analysis.
5. Gemini returns structured receipt fields through a server-only integration.
6. The application validates the response and opens an editable review form.
7. The user confirms a concrete destination wallet together with the extracted
   fields.
8. The transaction and permanent receipt reference are created only after user
   confirmation.
9. Pending objects are removed after completion, cancellation, or cleanup.

### Review spending

The dashboard summarizes the selected month, category distribution, and recent
transactions for all wallets or one explicitly selected wallet. Weekly and
monthly persisted insights remain account-wide, use Jakarta-aware boundaries,
and retain deterministic fallback behavior; the interface discloses this when
a wallet filter is active.

### Plan a monthly budget

1. The user opens Budget from primary navigation.
2. A rupiah limit can be set once for each active category and month.
3. Current spending is aggregated from the owner's transactions across every
   wallet.
4. The Budget page has no wallet filter because the plan applies to the whole
   account.
5. The interface marks categories at or above 80% as near the limit and at or
   above 100% as exceeded.
6. Warnings remain in-app and never block transaction entry.

### Ask about transactions

1. The user chooses a bounded period of up to 366 days and writes a question.
2. The user may ask across all wallets or the wallet selected in the Dashboard
   URL.
3. The server builds category, day, merchant, count, and total aggregates for
   the authenticated owner and requested wallet scope only.
4. Notes, receipt line items, receipt images, and raw object references are not
   included in the AI context.
5. Gemini receives the untrusted question separately from the financial facts.
6. The answer is displayed without storing a chat history; insufficient data
   produces an explicit limitation instead of an invented answer.

### Organize expenses with wallets

1. The account starts without a wallet; every wallet is created, named, and
   classified as `Bank`, `E-wallet`, `Tunai`, or `Lainnya` by the user from
   Profile.
2. A wallet identifies the source used for an expense, such as BCA, GoPay, or
   Tunai. Its type prepares consistent source handling without fetching or
   maintaining a live balance.
3. Dashboard and Transactions open in `Semua dompet`; choosing a wallet writes
   the scope to the URL so refresh and navigation remain predictable. Q&A uses
   that explicit reporting scope, while Budget remains account-wide.
4. Transaction creation and receipt review always require an explicit wallet
   selection.
5. Deleting a wallet permanently deletes all transactions plus receipt metadata
   and objects related to it, then clears stale persisted insights. Account-wide
   budgets remain intact. The same rule applies to an empty wallet and to the
   user's final wallet.

### Delete an account

1. The user enters an explicit confirmation phrase.
2. The account becomes unavailable while cleanup is in progress.
3. The deletion workflow waits for previously issued upload operations to
   expire, removes private receipt objects, and deletes account-owned records.
4. Retries and scheduled reconciliation can resume interrupted cleanup safely.
5. The user is signed out when deletion completes.

## Data and security model

- Google OAuth is handled through Supabase Auth using a PKCE callback flow.
- Protected pages and mutations verify the authenticated session on the server.
- The client cannot choose a trusted owner identifier.
- PostgreSQL Row Level Security prevents cross-user access at the database
  boundary.
- Receipt images are limited to supported formats, normalized to JPEG, and
  capped at 500 KB by the application.
- Object keys are generated by the server under owner-scoped prefixes.
- Upload and preview URLs expire quickly and are not persisted as transaction
  data.
- Gemini, R2, Supabase privileged, and scheduled-operation credentials remain
  server-only.
- Receipt content, AI responses, form payloads, route parameters, and export
  text are validated or sanitized at their trust boundaries.
- Receipt images are sent to the configured Gemini service only when the user
  requests analysis; extracted fields must be reviewed before saving.
- Account deletion covers authentication, database rows, private objects,
  retries, and orphan reconciliation.
- Budget and monthly-insight rows use owner-scoped RLS and cascade with the Auth
  account.
- Wallets and transactions use matching owner references enforced by composite
  foreign keys and RLS. Every new wallet requires an explicit supported type,
  while unclassified migration wallets use `Lainnya` until the owner corrects
  them. New transactions require an explicitly selected owned wallet;
  account-wide budgets remain protected by owner-scoped RLS.
- Permanent wallet deletion uses database cascades for transactions, removes
  private receipt objects first, preserves budgets, and invalidates persisted
  insights.
- Financial Q&A uses aggregate-only context, a one-year maximum range,
  per-account rate limits, and a global daily quota.

## Architecture

| Layer | Responsibility |
| --- | --- |
| Next.js App Router | Pages, server actions, API routes, authentication guards, and rendering |
| React and TypeScript | Interactive forms, review workflows, responsive navigation, and type-safe UI |
| Supabase Auth | Google authentication and session lifecycle |
| Supabase PostgreSQL | Transactions, categories, budgets, weekly/monthly insights, AI quota events, and deletion state |
| PostgreSQL RLS | Owner isolation and authorization at the database boundary |
| Cloudflare R2 | Private receipt object storage |
| Google Gemini | Structured receipt extraction, optional weekly/monthly narratives, and aggregate financial Q&A |
| Vercel | Application hosting and authenticated scheduled operations |

## Reliability expectations

- Provider failure must not create a partial transaction.
- Repeated scheduled requests must be idempotent.
- Pending receipt objects must be safe to retry and eligible for cleanup.
- Account deletion must resume after transient storage or network failures.
- Exports must preserve Unicode text and neutralize spreadsheet formulas.
- Offline fallback must not expose previously viewed private financial data.

## Success criteria

Phase 1 is successful when:

- a user can authenticate and manage only their own financial records;
- manual transactions update the dashboard and exports correctly;
- a supported receipt can be uploaded privately, analyzed, reviewed, corrected,
  and saved;
- failed AI or network operations offer a safe retry or manual path;
- weekly insights are deterministic under duplicate or provider-failure cases;
- account deletion removes the account's application data and private receipt
  objects without affecting another user; and
- the primary journeys remain usable across supported responsive viewports,
  keyboard navigation, and 200% zoom.

Phase 2 is successful when:

- transaction filters remain owner-scoped, composable, and stable through
  pagination;
- monthly category budgets report current spending without stale notification
  state;
- completed-month insight generation is idempotent and retains a deterministic
  fallback;
- financial Q&A cannot access another account or receipt-detail content and
  refuses unsupported conclusions; and
- all Phase 1 deletion and session barriers also cover Phase 2 records.

Phase 3 is successful when:

- existing records retain their totals in a migration wallet that has no
  special status, uses the safe `Lainnya` type until reviewed, and can be
  renamed, retyped, or deleted, while new accounts receive no automatic wallet;
- `Semua dompet` preserves the existing default experience and an explicit URL
  filter isolates Dashboard, Transactions, and Q&A correctly while Budget stays
  account-wide;
- manual and receipt transactions cannot be saved without an explicit owned
  wallet, and an existing transaction can move to another owned wallet;
- all-wallet exports include the source wallet without weakening spreadsheet
  safety;
- permanent wallet deletion removes its transactions, private receipt objects,
  and invalidated persisted insights without removing account-wide budgets,
  including when it is the final wallet; and
- no wallet operation crosses an RLS owner boundary.

Implementation and verification status are maintained in
[PROGRESS.md](./PROGRESS.md). Visual rules are defined in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).
