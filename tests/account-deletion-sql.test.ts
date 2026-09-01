import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Real PostgreSQL SQL/PLpgSQL/RLS in memory. The minimal Auth schema is a test
// double, NOT evidence that the remote Supabase project was migrated or tested.
let database: PGlite;
const sqlFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

beforeAll(async () => {
  database = new PGlite();
  await database.exec(`
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
    .sort()) {
    await database.exec(readFileSync(join(directory, file), "utf8"));
  }
}, 30_000);

afterAll(async () => {
  await database?.close();
});

describe("CP10 real PostgreSQL migration and RLS", () => {
  it("passes the read-only schema assertions after the entire migration history", async () => {
    await database.exec(
      sqlFile("supabase/tests/f1_cp10_schema_verification.sql"),
    );
  });
  it("passes rollback-only deletion isolation and leaves no fixture account or job", async () => {
    const result = await database.exec(
      sqlFile("supabase/tests/f1_cp10_deletion_isolation.sql"),
    );
    expect(result.at(-1)?.rows).toEqual([
      {
        result:
          "F1-CP10 isolation PASS: barriers, stale sessions, retries, and cascades verified; all fixtures rolled back.",
      },
    ]);
    expect(
      (
        await database.query(
          "select count(*)::integer as count from auth.users",
        )
      ).rows,
    ).toEqual([{ count: 0 }]);
    expect(
      (
        await database.query(
          "select count(*)::integer as count from public.account_deletion_requests",
        )
      ).rows,
    ).toEqual([{ count: 0 }]);
  });
});
