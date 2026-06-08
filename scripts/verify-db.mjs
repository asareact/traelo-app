/**
 * Verifies the schema was applied. Reads PG* env vars like run-migrations.mjs.
 */
import pg from "pg";

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const tables = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' order by table_name;
  `);
  console.log("Tablas en public:");
  tables.rows.forEach((r) => console.log("  -", r.table_name));

  const rls = await client.query(`
    select tablename, rowsecurity from pg_tables
    where schemaname = 'public' order by tablename;
  `);
  console.log("\nRLS habilitado:");
  rls.rows.forEach((r) => console.log(`  - ${r.tablename}: ${r.rowsecurity}`));

  const fns = await client.query(`
    select routine_name from information_schema.routines
    where routine_schema = 'public' order by routine_name;
  `);
  console.log("\nFunciones:");
  fns.rows.forEach((r) => console.log("  -", r.routine_name));

  const cfg = await client.query(`select key, value from config order by key;`);
  console.log("\nConfig:");
  cfg.rows.forEach((r) => console.log(`  - ${r.key} = ${r.value}`));
} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
