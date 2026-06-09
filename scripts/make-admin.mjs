/**
 * Applies the prevent_role_change bootstrap fix, lists users, and (optionally)
 * promotes a user to admin. Reads PG* env vars.
 *
 *   node scripts/make-admin.mjs            → fix + list users
 *   node scripts/make-admin.mjs <email>    → fix + promote that email to admin
 */
import pg from "pg";

const targetEmail = process.argv[2];

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
});

const FIX = `
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.rol is distinct from old.rol
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'No autorizado: no puedes cambiar el rol';
  end if;
  return new;
end;
$$;
`;

try {
  await client.connect();

  process.stdout.write("Aplicando fix del trigger... ");
  await client.query(FIX);
  console.log("OK\n");

  const users = await client.query(`
    select u.email, p.nombre, p.rol, u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
  `);

  if (users.rows.length === 0) {
    console.log("No hay usuarios registrados todavía.");
    console.log("Regístrate en http://localhost:3000/login y vuelve a correr esto.");
  } else {
    console.log("Usuarios registrados:");
    users.rows.forEach((u) =>
      console.log(`  - ${u.email}  (rol: ${u.rol || "sin perfil"})`),
    );
  }

  if (targetEmail) {
    const res = await client.query(
      `update profiles set rol = 'admin'
       where id = (select id from auth.users where email = $1)`,
      [targetEmail],
    );
    console.log(
      `\nPromoción a admin de ${targetEmail}: ${res.rowCount} fila(s) actualizada(s).`,
    );
  }
} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
