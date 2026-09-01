import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const migrationFiles = readdirSync(migrationsDirectory).filter((fileName) =>
  fileName.endsWith("_create_fintrack_core_schema.sql"),
);
const categoryIndexMigrationFiles = readdirSync(migrationsDirectory).filter(
  (fileName) => fileName.endsWith("_index_transactions_category_id.sql"),
);
const receiptAiMigrationFiles = readdirSync(migrationsDirectory).filter(
  (fileName) => fileName.endsWith("_f1_cp8_receipt_ai.sql"),
);
const weeklyInsightMigrationFiles = readdirSync(migrationsDirectory).filter(
  (fileName) => fileName.endsWith("_f1_cp9_weekly_insights.sql"),
);

expect(migrationFiles).toHaveLength(1);
expect(categoryIndexMigrationFiles).toHaveLength(1);
expect(receiptAiMigrationFiles).toHaveLength(1);
expect(weeklyInsightMigrationFiles).toHaveLength(1);

const migration = readFileSync(
  join(migrationsDirectory, migrationFiles[0]),
  "utf8",
).toLowerCase();
const categoryIndexMigration = readFileSync(
  join(migrationsDirectory, categoryIndexMigrationFiles[0]),
  "utf8",
).toLowerCase();
const receiptAiMigration = readFileSync(
  join(migrationsDirectory, receiptAiMigrationFiles[0]),
  "utf8",
).toLowerCase();
const weeklyInsightMigration = readFileSync(
  join(migrationsDirectory, weeklyInsightMigrationFiles[0]),
  "utf8",
).toLowerCase();

describe("F1-CP4 database migration", () => {
  it.each(["categories", "transactions", "weekly_insights"])(
    "creates and protects public.%s",
    (tableName) => {
      expect(migration).toContain(`create table public.${tableName}`);
      expect(migration).toContain(
        `alter table public.${tableName} enable row level security`,
      );
      expect(migration).toContain(
        `revoke all on table public.${tableName} from public, anon, authenticated`,
      );
    },
  );

  it("keeps category mutation outside the authenticated Data API surface", () => {
    expect(migration).toContain(
      "grant select on table public.categories to authenticated",
    );
    expect(migration).not.toContain(
      "grant select, insert, update, delete on table public.categories to authenticated",
    );
  });

  it.each(["transactions", "weekly_insights"])(
    "defines complete owner-scoped CRUD policies for %s",
    (tableName) => {
      const tablePolicyBlock = migration.match(
        new RegExp(
          `create policy[\\s\\S]+?on public\\.${tableName}[\\s\\S]+?for select[\\s\\S]+?` +
            `create policy[\\s\\S]+?on public\\.${tableName}[\\s\\S]+?for insert[\\s\\S]+?` +
            `create policy[\\s\\S]+?on public\\.${tableName}[\\s\\S]+?for update[\\s\\S]+?` +
            `create policy[\\s\\S]+?on public\\.${tableName}[\\s\\S]+?for delete`,
        ),
      );

      expect(tablePolicyBlock).not.toBeNull();
      expect(migration).toContain(
        "using ((select auth.uid()) = user_id)\nwith check ((select auth.uid()) = user_id)",
      );
    },
  );

  it("cascades user deletion without cascading category deletion", () => {
    expect(
      migration.match(/references auth\.users \(id\) on delete cascade/g),
    ).toHaveLength(2);
    expect(migration).toContain(
      "category_id uuid not null references public.categories (id)",
    );
    expect(migration).not.toContain(
      "references public.categories (id) on delete cascade",
    );
  });

  it("stores private receipt keys and only reviewed receipt items", () => {
    expect(migration).toContain(
      "receipt_object_key like ('receipts/' || user_id::text || '/%')",
    );
    expect(migration).toContain("receipt_object_key !~ '^(https?:)?//'");
    expect(migration).toContain(
      "check (jsonb_typeof(receipt_items) = 'array')",
    );
    expect(migration).toContain(
      "check (octet_length(receipt_items::text) <= 262144)",
    );
    expect(migration).toContain("raw gemini responses must not be persisted");
  });

  it("uses an invoker trigger function and no security definer function", () => {
    expect(migration).toContain("security invoker");
    expect(migration).not.toContain("security definer");
  });

  it.each([
    "food-drink",
    "transportation",
    "shopping",
    "bills",
    "health",
    "other",
  ])("seeds the stable %s category slug", (slug) => {
    expect(migration).toContain(`('${slug}'`);
  });

  it("adds the user-scoped dashboard indexes", () => {
    expect(migration).toContain("transactions_user_date_idx");
    expect(migration).toContain("transactions_user_category_date_idx");
    expect(migration).toContain("weekly_insights_user_generated_at_idx");
  });

  it("covers the category foreign key with a category-leading index", () => {
    expect(categoryIndexMigration).toContain(
      "create index transactions_category_id_idx",
    );
    expect(categoryIndexMigration).toContain(
      "on public.transactions (category_id)",
    );
  });
});

describe("F1-CP8 receipt AI migration", () => {
  it("creates a persistent owner-scoped request ledger", () => {
    expect(receiptAiMigration).toContain(
      "create table public.ai_request_events",
    );
    expect(receiptAiMigration).toContain(
      "alter table public.ai_request_events enable row level security",
    );
    expect(receiptAiMigration).toContain(
      "with check ((select auth.uid()) = user_id)",
    );
    expect(receiptAiMigration).not.toContain("gemini_response");
  });

  it("keeps quota enforcement invoker-scoped and atomic per user", () => {
    expect(receiptAiMigration).toContain(
      "function public.consume_receipt_ai_quota",
    );
    expect(receiptAiMigration).toContain("security invoker");
    expect(receiptAiMigration).toContain("pg_advisory_xact_lock");
    expect(receiptAiMigration).toContain(
      "revoke all on function public.consume_receipt_ai_quota(uuid)",
    );
    expect(receiptAiMigration).toContain(
      "grant execute on function public.consume_receipt_ai_quota(uuid) to authenticated",
    );
    expect(receiptAiMigration).not.toContain("security definer");
  });

  it("makes the permanent private receipt key idempotent", () => {
    expect(receiptAiMigration).toContain(
      "create unique index transactions_receipt_object_key_unique_idx",
    );
    expect(receiptAiMigration).toContain(
      "where receipt_object_key is not null",
    );
  });
});

describe("F1-CP9 weekly insight migration", () => {
  it("persists deterministic facts without exposing user mutation", () => {
    expect(weeklyInsightMigration).toContain(
      "add column transaction_count integer not null default 0",
    );
    expect(weeklyInsightMigration).toContain(
      "revoke insert, update, delete on table public.weekly_insights from authenticated",
    );
    expect(weeklyInsightMigration).toContain(
      'drop policy if exists "users can create their own weekly insights"',
    );
  });

  it("keeps aggregate input privileged, invoker-scoped, and metadata-only", () => {
    expect(weeklyInsightMigration).toContain(
      "function public.get_weekly_insight_candidates",
    );
    expect(weeklyInsightMigration).toContain("security invoker");
    expect(weeklyInsightMigration).toContain("set search_path = ''");
    expect(weeklyInsightMigration).toContain(
      "grant execute on function public.get_weekly_insight_candidates(date)\nto service_role",
    );
    expect(weeklyInsightMigration).not.toContain("transaction_row.merchant");
    expect(weeklyInsightMigration).not.toContain("transaction_row.notes");
    expect(weeklyInsightMigration).not.toContain("receipt_object_key");
  });

  it("adds a date-leading aggregate covering index", () => {
    expect(weeklyInsightMigration).toContain(
      "create index transactions_date_user_insight_idx",
    );
    expect(weeklyInsightMigration).toContain(
      "on public.transactions (transaction_date, user_id, category_id)",
    );
    expect(weeklyInsightMigration).toContain("include (amount_idr)");
  });
});
