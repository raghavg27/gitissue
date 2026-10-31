import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Smoke tests: run every migration on a real Postgres (PGlite, in memory), then use the tables
// and functions. The small stubs stand in for the parts of Supabase that the migrations use.
const SUPABASE_STUBS = `
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;

const dir = path.resolve(__dirname, "../migrations");
let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(dir, file), "utf8"));
  }
});

afterAll(() => db.close());

type Hit = { allowed: boolean; remaining: number; reset_at: Date };
const hit = async (key: string, limit: number, windowSeconds = 3600) =>
  (await db.query<Hit>("select * from public.hit_rate_limit($1, $2, $3)", [key, limit, windowSeconds])).rows[0];

describe("migrations", () => {
  it("turn on row-level security for every public table", async () => {
    const { rows } = await db.query<{ relname: string; relrowsecurity: boolean }>(
      "select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'",
    );
    expect(rows.map((r) => r.relname).sort()).toEqual(["device_profiles", "profiles", "rate_limits", "reports"]);
    expect(rows.every((r) => r.relrowsecurity)).toBe(true);
  });

  it("leave no browser upload policy on screenshots and allow no SVG", async () => {
    const policies = await db.query("select policyname from pg_policies where schemaname = 'storage'");
    expect(policies.rows).toEqual([]);
    const bucket = await db.query<{ allowed_mime_types: string[] }>("select allowed_mime_types from storage.buckets where id = 'screenshots'");
    expect(bucket.rows[0].allowed_mime_types).toEqual(["image/png", "image/jpeg", "image/gif", "image/webp"]);
  });

  it("let only the service role run the rate-limit function", async () => {
    const { rows } = await db.query<{ anon: boolean; authenticated: boolean; service: boolean }>(
      `select has_function_privilege('anon', 'public.hit_rate_limit(text,int,int)', 'execute') as anon,
              has_function_privilege('authenticated', 'public.hit_rate_limit(text,int,int)', 'execute') as authenticated,
              has_function_privilege('service_role', 'public.hit_rate_limit(text,int,int)', 'execute') as service`,
    );
    expect(rows[0]).toEqual({ anon: false, authenticated: false, service: true });
  });
});

describe("hit_rate_limit", () => {
  it("counts hits and blocks after the limit", async () => {
    expect(await hit("k-count", 2)).toMatchObject({ allowed: true, remaining: 1 });
    expect(await hit("k-count", 2)).toMatchObject({ allowed: true, remaining: 0 });
    expect(await hit("k-count", 2)).toMatchObject({ allowed: false, remaining: 0 });
    const { rows } = await db.query<{ count: number }>("select count from public.rate_limits where key = 'k-count'");
    expect(rows[0].count).toBe(3);
  });

  it("keeps separate counters per key", async () => {
    await hit("k-a", 1);
    expect(await hit("k-b", 1)).toMatchObject({ allowed: true });
  });

  it("starts a new window after the reset time", async () => {
    await hit("k-reset", 1);
    expect(await hit("k-reset", 1)).toMatchObject({ allowed: false });
    await db.query("update public.rate_limits set reset_at = now() - interval '1 second' where key = 'k-reset'");
    expect(await hit("k-reset", 1)).toMatchObject({ allowed: true, remaining: 0 });
  });

  it("deletes hashes that expired more than a day ago", async () => {
    await db.query("insert into public.rate_limits (key, count, reset_at) values ('k-old', 5, now() - interval '2 days')");
    await hit("k-trigger", 10);
    const { rows } = await db.query("select key from public.rate_limits where key = 'k-old'");
    expect(rows).toEqual([]);
  });
});

describe("row-level security", () => {
  it("shows a user only their own reports", async () => {
    const [me, other] = ["00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002"];
    await db.exec(`insert into auth.users values ('${me}'), ('${other}')`);
    await db.exec(`
      insert into public.reports (user_id, repo_full_name, issue_number, issue_url, action, title) values
        ('${me}', 'o/r', 1, 'https://github.com/o/r/issues/1', 'created', 'mine'),
        ('${other}', 'o/r', 2, 'https://github.com/o/r/issues/2', 'created', 'theirs');
      grant select on public.reports to authenticated;
    `);
    await db.exec(`set role authenticated; select set_config('test.uid', '${me}', false);`);
    const { rows } = await db.query<{ title: string }>("select title from public.reports");
    await db.exec("reset role");
    expect(rows).toEqual([{ title: "mine" }]);
  });
});
