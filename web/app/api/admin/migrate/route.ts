import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export const maxDuration = 60;

/**
 * Applies db/schema.sql to the Neon database. Pass { "wipe": true } in the
 * body to drop the entire public schema first (destructive).
 * Protected by the MIGRATE_SECRET env var via the x-migrate-secret header.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret || request.headers.get("x-migrate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wipe = false } = await request.json().catch(() => ({}));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    if (wipe) {
      await client.query(
        readFileSync(join(process.cwd(), "db", "wipe.sql"), "utf8")
      );
    }
    await client.query(
      readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8")
    );

    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    return NextResponse.json({
      ok: true,
      wiped: wipe,
      tables: rows.map((r) => r.tablename),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => {});
  }
}
