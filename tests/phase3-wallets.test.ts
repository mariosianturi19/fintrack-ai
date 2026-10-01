import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseTransactionFilters } from "../src/features/transactions/filters";
import {
  createWalletScopeQuery,
  getWalletOptionLabel,
} from "../src/features/wallets/scope-query";
import { resolveWalletScope } from "../src/features/wallets/scope";
import type { WalletRecord } from "../src/features/wallets/domain";
import { walletFormSchema } from "../src/features/wallets/validation";

const bcaWallet: WalletRecord = {
  createdAt: "2026-10-01T00:00:00.000Z",
  id: "6d45ad1d-a780-4297-9d4e-a4ad61a7f90f",
  name: "BCA",
  updatedAt: "2026-10-01T00:00:00.000Z",
  walletType: "bank",
};
const gopayWallet: WalletRecord = {
  createdAt: "2026-10-01T00:30:00.000Z",
  id: "c50c3e14-fcc8-41ff-a8a1-30e5ca56f05b",
  name: "GoPay",
  updatedAt: "2026-10-01T01:00:00.000Z",
  walletType: "e_wallet",
};

describe("Phase 3 wallet URL contract", () => {
  it("defaults to all wallets and resolves only an owned wallet", () => {
    expect(resolveWalletScope([bcaWallet], null)).toMatchObject({
      label: "Semua dompet",
      selectedWallet: null,
      walletId: null,
    });
    expect(
      resolveWalletScope([bcaWallet, gopayWallet], gopayWallet.id),
    ).toMatchObject({
      label: "GoPay",
      selectedWallet: gopayWallet,
      walletId: gopayWallet.id,
    });
    expect(
      resolveWalletScope([bcaWallet], crypto.randomUUID()).walletId,
    ).toBeNull();
  });

  it("keeps wallet scope explicit while discarding transient pagination", () => {
    const query = createWalletScopeQuery(bcaWallet.id, {
      category: "food",
      page: "4",
      status: "created",
      wallet: gopayWallet.id,
    });
    expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
      category: "food",
      wallet: bcaWallet.id,
    });
    expect(parseTransactionFilters({ wallet: bcaWallet.id }).walletId).toBe(
      bcaWallet.id,
    );
    expect(getWalletOptionLabel(bcaWallet)).toBe("Bank · BCA");
    expect(getWalletOptionLabel(gopayWallet)).toBe("E-wallet · GoPay");
  });

  it("requires an explicit supported type for every user-created wallet", () => {
    expect(walletFormSchema.safeParse({ name: "BCA" }).success).toBe(false);
    expect(
      walletFormSchema.safeParse({ name: "BCA", walletType: "bank" }).success,
    ).toBe(true);
    expect(
      walletFormSchema.safeParse({ name: "Kripto", walletType: "crypto" })
        .success,
    ).toBe(false);
  });
});

let database: PGlite;
const sqlFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

async function createTestDatabase(lastMigration?: string) {
  const testDatabase = new PGlite();
  await testDatabase.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    grant usage on schema auth, public to anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key, email text, aud text, role text,
      created_at timestamptz, updated_at timestamptz, deleted_at timestamptz
    );
    create table auth.sessions (
      id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
      created_at timestamptz, updated_at timestamptz, not_after timestamptz
    );
    create function auth.jwt() returns jsonb language sql stable as $$
      select nullif(current_setting('request.jwt.claims', true), '')::jsonb;
    $$;
    create function auth.uid() returns uuid language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), auth.jwt()->>'sub')::uuid;
    $$;
  `);
  const directory = join(process.cwd(), "supabase/migrations");
  for (const file of readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .filter((file) => !lastMigration || file <= lastMigration)
    .sort()) {
    await testDatabase.exec(readFileSync(join(directory, file), "utf8"));
  }
  return testDatabase;
}

beforeAll(async () => {
  database = await createTestDatabase();
}, 30_000);

afterAll(async () => {
  await database?.close();
});

describe("Phase 3 real PostgreSQL wallet boundary", () => {
  it("backfills migration wallets safely and requires an explicit type afterward", async () => {
    const migrationDatabase = await createTestDatabase(
      "20261001210000_phase3_global_budgets.sql",
    );

    try {
      await migrationDatabase.exec(`
        insert into auth.users (id, email, aud, role, created_at, updated_at)
        values (
          '9d23db89-c46e-4017-8e3e-8b49d36a0894',
          'wallet-type@example.invalid',
          'authenticated',
          'authenticated',
          now(),
          now()
        );
        insert into public.wallets (id, user_id, name)
        values (
          'c61ed006-daee-4a79-a0f1-785df652e3a2',
          '9d23db89-c46e-4017-8e3e-8b49d36a0894',
          'Migrasi lama'
        );
      `);
      await migrationDatabase.exec(
        sqlFile("supabase/migrations/20261001230000_phase3_wallet_types.sql"),
      );

      const result = await migrationDatabase.exec(`
        select wallet_type
        from public.wallets
        where id = 'c61ed006-daee-4a79-a0f1-785df652e3a2';
      `);
      expect(result.at(-1)?.rows).toEqual([{ wallet_type: "other" }]);

      await expect(
        migrationDatabase.exec(`
          insert into public.wallets (user_id, name)
          values ('9d23db89-c46e-4017-8e3e-8b49d36a0894', 'Tanpa tipe');
        `),
      ).rejects.toThrow();
      await expect(
        migrationDatabase.exec(`
          insert into public.wallets (user_id, name, wallet_type)
          values (
            '9d23db89-c46e-4017-8e3e-8b49d36a0894',
            'Tipe tidak valid',
            'crypto'
          );
        `),
      ).rejects.toThrow();
    } finally {
      await migrationDatabase.close();
    }
  }, 30_000);

  it("merges existing wallet budgets into one account-wide limit", async () => {
    const migrationDatabase = await createTestDatabase(
      "20261001130000_phase3_user_managed_wallets.sql",
    );

    try {
      await migrationDatabase.exec(`
        insert into auth.users (id, email, aud, role, created_at, updated_at)
        values (
          'f7a6c8e5-2952-49cf-a3d3-eb1688a32890',
          'global-budget@example.invalid',
          'authenticated',
          'authenticated',
          now(),
          now()
        );
        insert into public.wallets (id, user_id, name) values
          (
            '4ec6154e-37b7-454e-b258-3b8a930b6b31',
            'f7a6c8e5-2952-49cf-a3d3-eb1688a32890',
            'BCA'
          ),
          (
            '72749d4a-64a6-46aa-b6eb-e283d2861187',
            'f7a6c8e5-2952-49cf-a3d3-eb1688a32890',
            'GoPay'
          );
        insert into public.category_budgets (
          user_id, category_id, wallet_id, month_start, limit_amount_idr
        ) values
          (
            'f7a6c8e5-2952-49cf-a3d3-eb1688a32890',
            (select id from public.categories where slug = 'food-drink'),
            '4ec6154e-37b7-454e-b258-3b8a930b6b31',
            '2026-10-01',
            100000
          ),
          (
            'f7a6c8e5-2952-49cf-a3d3-eb1688a32890',
            (select id from public.categories where slug = 'food-drink'),
            '72749d4a-64a6-46aa-b6eb-e283d2861187',
            '2026-10-01',
            200000
          );
      `);
      await migrationDatabase.exec(
        sqlFile("supabase/migrations/20261001210000_phase3_global_budgets.sql"),
      );

      const result = await migrationDatabase.exec(`
        select
          count(*)::text as row_count,
          sum(limit_amount_idr)::text as merged_limit_amount_idr
        from public.category_budgets
        where user_id = 'f7a6c8e5-2952-49cf-a3d3-eb1688a32890'
          and month_start = '2026-10-01';
      `);
      expect(result.at(-1)?.rows).toEqual([
        { merged_limit_amount_idr: "300000", row_count: "1" },
      ]);
    } finally {
      await migrationDatabase.close();
    }
  }, 30_000);

  it("passes the read-only wallet schema assertions", async () => {
    const result = await database.exec(
      sqlFile("supabase/tests/f3_wallet_schema_verification.sql"),
    );
    expect(result.at(-1)?.rows).toEqual([
      {
        result:
          "F3 schema PASS: typed user-managed wallets, global budgets, explicit transaction references, permanent deletion, aggregate filters, grants, and RLS are present.",
      },
    ]);
  });

  it("passes rollback-only owner, deletion, and aggregate isolation", async () => {
    const result = await database.exec(
      sqlFile("supabase/tests/f3_wallet_isolation.sql"),
    );
    expect(result.at(-1)?.rows).toEqual([
      {
        result:
          "F3 isolation PASS: typed explicit creation, owner boundaries, scoped aggregates, permanent transaction deletion, and global budget preservation verified; fixtures rolled back.",
      },
    ]);
  });
});
