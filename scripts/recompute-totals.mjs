/**
 * One-off backfill: recompute pedidos.total_real_usd for orders that already
 * have a weight registered. Before the "fold shipping into the total" fix,
 * registrarPeso saved the weight but left total_real_usd as products-only, so
 * those orders are missing the shipping charge. This sets:
 *
 *   total_real_usd = SUM(precio_real_usd * cantidad)  +  GREATEST(1, peso_lb) * precio_por_lb
 *
 * Idempotent: re-running it yields the same totals. Only touches orders with a
 * weight set; untouched orders (no weight yet) keep their products-only total.
 *
 * Usage (pooler):
 *   PGHOST=aws-1-us-east-1.pooler.supabase.com PGPORT=6543 \
 *   PGUSER=postgres.fbwjxzbroasrqhefprwv PGPASSWORD=... PGDATABASE=postgres \
 *     node scripts/recompute-totals.mjs
 */
import pg from "pg";

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

const SQL = `
UPDATE pedidos p
SET total_real_usd = round(
  (sub.productos + GREATEST(1, p.peso_lb) * cfg.precio)::numeric, 2
)
FROM (
  SELECT pedido_id, SUM(precio_real_usd * cantidad) AS productos
  FROM pedido_items
  WHERE precio_real_usd IS NOT NULL
  GROUP BY pedido_id
) sub
CROSS JOIN (
  SELECT COALESCE(value::numeric, 7.00) AS precio
  FROM config WHERE key = 'precio_por_lb'
) cfg
WHERE p.id = sub.pedido_id
  AND p.peso_lb IS NOT NULL
RETURNING p.id, p.peso_lb, p.total_real_usd;
`;

try {
  console.log(`Conectando a ${process.env.PGHOST}:${process.env.PGPORT}...`);
  await client.connect();
  console.log("Conectado.\n");

  const { rows } = await client.query(SQL);
  if (rows.length === 0) {
    console.log("No hay pedidos con peso registrado. Nada que recalcular.");
  } else {
    console.log(`Recalculados ${rows.length} pedido(s):`);
    for (const r of rows) {
      console.log(
        `  #${String(r.id).slice(0, 8)} · ${r.peso_lb} lb → total $${r.total_real_usd}`,
      );
    }
  }
  console.log("\n✓ Listo.");
} catch (err) {
  console.error("\nERROR:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
