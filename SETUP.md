# Traelo — Setup

## Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena con tus claves de Supabase
(Dashboard → Project Settings → API).

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Base de datos

Las migraciones están en `supabase/migrations/`. Aplícalas con:

```bash
PGHOST="aws-1-us-east-1.pooler.supabase.com" PGPORT="6543" \
PGUSER="postgres.TU-REF" PGPASSWORD='TU-PASSWORD' PGDATABASE="postgres" \
node scripts/run-migrations.mjs
```

(O pega el SQL de cada archivo en el SQL Editor de Supabase, en orden.)

Verifica con `node scripts/verify-db.mjs` (mismas env vars).

## Autenticación

### Email + contraseña
Funciona out of the box. Por defecto Supabase pide **confirmación de correo**.
Para desarrollo puedes desactivarla en:
**Dashboard → Authentication → Sign In / Providers → Email → "Confirm email" OFF.**
Si la dejas activa, el usuario debe confirmar el correo antes de entrar (el form
ya muestra "Revisa tu correo").

### Google OAuth
El botón "Continuar con Google" ya está en `/login`. Para que funcione hay que
habilitar el proveedor:

**1. Google Cloud Console** (https://console.cloud.google.com)
   - Crea o selecciona un proyecto.
   - APIs & Services → OAuth consent screen → External → completa nombre + email.
   - APIs & Services → Credentials → Create Credentials → OAuth client ID →
     **Web application**.
   - En **Authorized redirect URIs** agrega exactamente:
     ```
     https://fbwjxzbroasrqhefprwv.supabase.co/auth/v1/callback
     ```
   - Copia el **Client ID** y el **Client Secret**.

**2. Supabase Dashboard**
   - Authentication → Sign In / Providers → **Google** → Enable.
   - Pega Client ID y Client Secret → Save.

**3. URL Configuration** (Authentication → URL Configuration)
   - **Site URL:** `http://localhost:3000` (dev) — cambia a tu dominio en prod.
   - **Redirect URLs:** agrega
     ```
     http://localhost:3000/auth/callback
     https://TU-DOMINIO/auth/callback
     ```

Tras esto, "Continuar con Google" funciona. El callback server-side está en
`src/app/auth/callback/route.ts`.

## Crear el primer admin

Por seguridad, `profiles.rol` no es modificable por clientes. Para hacerte admin,
corre este SQL en el SQL Editor de Supabase (reemplaza el email):

```sql
update profiles set rol = 'admin'
where id = (select id from auth.users where email = 'tu@email.com');
```

## Correr el proyecto

```bash
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción
```
