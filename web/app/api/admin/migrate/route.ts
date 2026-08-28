import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";

export const maxDuration = 60;

/**
 * Applies db/schema.sql to the production database without needing local
 * psql access. Protected by MIGRATE_SECRET. Pass {"wipe": true} to drop the
 * public schema first (destructive).
 */
export async function POST(request: Request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const wipe = body.wipe === true;

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    if (wipe) {
      await client.query(readFileSync(join(process.cwd(), "db", "wipe.sql"), "utf8"));
    }
    await client.query(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));
    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    return NextResponse.json({ ok: true, wiped: wipe, tables: rows.map((r) => r.tablename) });
  } finally {
    await client.end().catch(() => {});
  }
}
