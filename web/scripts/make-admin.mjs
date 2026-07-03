#!/usr/bin/env node
// Promotes an existing user to admin: node scripts/make-admin.mjs you@example.com
import pg from "pg";

const email = process.argv[2];
if (!email || !process.env.DATABASE_URL) {
  console.error("Usage: DATABASE_URL=... node scripts/make-admin.mjs user@example.com");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const result = await client.query(
  `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id`,
  [email]
);
console.log(result.rowCount === 1 ? `${email} is now an admin.` : `No user found for ${email}.`);
await client.end();
