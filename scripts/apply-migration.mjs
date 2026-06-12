/**
 * Apply a SINGLE migration file (run-migrations.mjs re-applies all of them, which
 * fails on non-idempotent ones like 0002's create policy). Use this for one-off
 * additive migrations.
 *
 * Usage:
 *   PGHOST=... PGPORT=6543 PGUSER=... PGPASSWORD=... PGDATABASE=postgres \
 *     node scripts/apply-migration.mjs 0006_tipo_envio.sql
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
if (!file) {
  console.error("Falta el nombre del archivo de migración.");
  process.exit(1);
}
const sql = readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", file),
  "utf8",
);

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

try {
  await client.connect();
  process.stdout.write(`Aplicando ${file}... `);
  await client.query(sql);
  console.log("OK");
} catch (err) {
  console.error("\nERROR:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
