/**
 * One-off migration runner. Applies supabase/migrations/0*.sql in order.
 * Reads connection config from PG* env vars (avoids URL-encoding the password).
 *
 * Usage:
 *   PGHOST=... PGPORT=6543 PGUSER=... PGPASSWORD=... PGDATABASE=postgres \
 *     node scripts/run-migrations.mjs
 */
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.join(__dirname, "..", "supabase", "migrations");

// Only numbered migration files, in order. Skip any _combined.sql etc.
const files = readdirSync(migDir)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort();

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
  console.log(`Conectando a ${process.env.PGHOST}:${process.env.PGPORT}...`);
  await client.connect();
  console.log("Conectado.\n");

  for (const f of files) {
    const sql = readFileSync(path.join(migDir, f), "utf8");
    process.stdout.write(`Aplicando ${f}... `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("\n✓ Todas las migraciones aplicadas.");
} catch (err) {
  console.error("\nERROR:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
