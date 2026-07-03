#!/usr/bin/env node
// Applies db/schema.sql to the Neon database pointed at by DATABASE_URL.
// Usage:
//   node scripts/migrate.mjs          apply schema
//   node scripts/migrate.mjs --wipe   drop the public schema first (destructive)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const wipe = process.argv.includes("--wipe");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  if (wipe) {
    console.log("Wiping public schema (dropping all tables)...");
    await client.query(readFileSync(join(root, "db", "wipe.sql"), "utf8"));
  }

  console.log("Applying db/schema.sql...");
  await client.query(readFileSync(join(root, "db", "schema.sql"), "utf8"));

  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log(`Done. ${rows.length} tables:`);
  for (const { tablename } of rows) console.log(`  - ${tablename}`);
} finally {
  await client.end();
}
