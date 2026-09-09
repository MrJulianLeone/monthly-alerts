#!/usr/bin/env node
// Ad-hoc SQL runner against DATABASE_URL (use with --env-file).
// Usage: node --env-file=.env.production.local scripts/query.mjs "<sql>" '[params-json]'
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const sql = neon(url);
const text = process.argv[2];
const params = process.argv[3] ? JSON.parse(process.argv[3]) : [];
const rows = await sql.query(text, params);
console.log(JSON.stringify(rows, null, 1));
