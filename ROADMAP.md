# Traelo — Roadmap & Task Tracker

> **Fuente de verdad del proyecto.** Si abres una sesión nueva sin contexto previo:
> lee este archivo completo + `DESIGN.md` + `SETUP.md` y podrás continuar.
> Marca las tareas `[x]` a medida que las completas y actualiza "Estado actual".

---

## 1. ¿Qué es Traelo? (brief de 30 segundos)

Plataforma web para **gestionar pedidos de SHEIN enviados a Cuba**. El cliente pega
links de SHEIN + talla/color, el admin verifica precios reales y los procesa, y el
cliente sigue el estado de su pedido hasta la entrega con un link de tracking público
y compartible.

**No es una tienda ni un checkout.** Es: gestión de pedidos + negociación + tracking.
El pago ocurre fuera de la plataforma (en persona: CUP efectivo al cambio del Toque,
USD o MLC). El diferenciador es la **transparencia y la confianza** frente a los
revendedores informales de Facebook.

Usuario objetivo: cubanas jóvenes (18-30), mobile-first, que llegan por Facebook/WhatsApp.

---

## 2. Estado actual (ACTUALIZAR en cada sesión)

- **Branch de trabajo:** `feat/foundation-auth`
- **Última fase completada:** Fase 1 (fundación + DB + auth + landing premium)
- **Próximo:** Fase 2 (formulario de pedido + tracking público)
- **PR a main:** pendiente de crear por web (ver sección 4 — no usar `gh`)
- **Deploy Vercel:** configurado, requiere env vars en el dashboard (ver Fase 7)
- **Primer admin:** `asarria952807@gmail.com` (rol admin en DB)

---

## 3. Stack y convenciones CRÍTICAS (Next 16 es nuevo — no asumas patrones viejos)

- **Next.js 16** (App Router) + **React 19** + **Tailwind v4**
- **Tailwind v4:** los design tokens van en `@theme` dentro de `src/app/globals.css`.
  **NO hay `tailwind.config.js`.** Utilidades: `bg-bg`, `bg-surface`, `text-primary`,
  `text-accent`, `text-muted`, `border-border`, `rounded-md/lg/full`, `font-display`
  (Fraunces), `font-sans` (Plus Jakarta).
- **Middleware → Proxy:** Next 16 renombró `middleware` a **`proxy`**. El archivo es
  `src/proxy.ts` (exporta `proxy`). El helper de sesión está en `src/lib/supabase/middleware.ts`.
- **params / searchParams son Promises** → hay que `await`-earlos.
- **Supabase (`@supabase/ssr`):**
  - `src/lib/supabase/client.ts` — cliente browser (Client Components)
  - `src/lib/supabase/server.ts` — `createClient()` (server, async, usa cookies) +
    `createAdminClient()` (service_role, server-only, bypassa RLS)
  - Claves nuevas: `sb_publishable_` (anon) y `sb_secret_` (service_role)
- **Auth:** email/password + Google OAuth. Server actions en `src/app/login/actions.ts`.
  Callback OAuth en `src/app/auth/callback/route.ts`.
- **npm:** `.npmrc` fija el registry público (`registry.npmjs.org`). **No lo borres** —
  sin él, el `~/.npmrc` global del usuario (Artifactory de Cox) contamina el lockfile
  y rompe el build de Vercel (E401).
- **Reglas de negocio y términos:** ver `DESIGN.md`. Importante: **nunca mostrar la
  palabra "casillero" al cliente** (es lógica interna con WeShipYou). Al cliente se le
  habla de "EE.UU.".

---

## 4. Cómo retomar (para una sesión sin contexto)

1. **Lee:** este archivo + `DESIGN.md` (sistema de diseño + reglas de negocio +
   inventario de páginas) + `SETUP.md` (env, auth, Supabase).
2. **Corre dev:** `npm run dev` → http://localhost:3000. Las credenciales están en
   `.env.local` (gitignored, ya existe en la máquina del fundador).
3. **DB:** proyecto Supabase `fbwjxzbroasrqhefprwv`. Migraciones en `supabase/migrations/`.
   Aplicar con `scripts/run-migrations.mjs` usando env vars PG (pooler):
   `PGHOST=aws-1-us-east-1.pooler.supabase.com PGPORT=6543 PGUSER=postgres.fbwjxzbroasrqhefprwv PGPASSWORD=... PGDATABASE=postgres node scripts/run-migrations.mjs`
   (la conexión directa `db.<ref>.supabase.co` NO resuelve — Supabase deshabilitó IPv4 directo).
4. **Git / push:** el remote usa el alias SSH `git@github-asareact:...` (cuenta asareact).
   **NO usar `gh`** — está logueado con otra cuenta (asarriatomic) sin permisos. Los PR
   se crean por la web: `https://github.com/asareact/traelo-app/compare/main...<branch>?expand=1`
5. **Antes de commitear:** corre `npm run build` y verifica que pasa. Sigue `DESIGN.md`
   para todo lo visual. Un commit por cambio lógico.
6. **Verificación visual:** usa el browser headless de gstack
   (`~/.claude/skills/gstack/browse/dist/browse goto <url>` + `screenshot`) para confirmar.

---

## 5. Fases y tareas

### ✅ Fase 0 — Setup del proyecto (DONE)
- [x] Repo + CLAUDE.md con skill routing
- [x] /office-hours, /plan-eng-review, /plan-ceo-review (diseño aprobado)
- [x] /design-consultation → DESIGN.md (sistema "Verano Confiable")
- [x] /design-review → wireframes de las páginas + landing completo

### ✅ Fase 1 — Fundación + DB + Auth (DONE)
- [x] Scaffold Next 16 + React 19 + Tailwind v4 + design tokens en globals.css
- [x] Fuentes Fraunces + Plus Jakarta (layout.tsx)
- [x] Migraciones aplicadas a Supabase: `profiles`, `pedidos`, `pedido_items`,
      `estados_pedido`, `notificaciones`, `config` + RLS en todas + triggers
- [x] Función atómica `update_order_state` (Postgres)
- [x] Clientes Supabase (browser + server + admin) + proxy con guards de ruta
- [x] Auth: email/password + Google OAuth (código), server actions, callback
- [x] Logo SVG (caja + flecha) en nav/login/dashboard
- [x] Landing completo de 9 secciones, rediseño premium (íconos SVG, reveals, hero showcase)
- [x] Primer admin creado en DB
- [x] Fix registry público para Vercel (.npmrc)

### ⬜ Fase 2 — Formulario de pedido + tracking público (PRÓXIMO)
- [ ] `/pedidos/nuevo` — formulario multi-item: por item URL SHEIN + talla + color +
      cantidad + notas. Botón "Agregar otro producto". Mobile-first. Requiere auth.
- [ ] Server action / `POST /api/pedidos` — crea `pedido` (estado COTIZACION) +
      sus `pedido_items` (RLS: cliente inserta en su propio pedido)
- [ ] `/pedidos/[id]` — **tracking público SIN auth**. Header con estado actual +
      barra de progreso. Timeline vertical de estados (usar `ESTADO_LABEL` de types.ts).
      Botón "copiar link". Es página standalone (sin nav ni bottom bar).
- [ ] Redirect tras crear pedido → a su tracking o al dashboard
- [ ] Tests (form validation, creación de pedido, RLS aislamiento)

### ⬜ Fase 3 — Dashboard cliente + perfil
- [ ] `/dashboard` — lista real de pedidos del cliente con stats (activos, histórico,
      USD gastado) + badges de estado. Bottom tab bar.
- [ ] `/perfil` — nombre, teléfono, dirección, cerrar sesión. Bottom tab bar.
- [ ] Componente `BottomTabBar` (móvil): Inicio · Pedidos · Perfil
- [ ] Badge de estado reutilizable (colores por estado, ver DESIGN.md)

### ⬜ Fase 4 — Admin Kanban + procesar items
- [ ] `/admin/kanban` — columnas por estado, cards de pedido, botón "Avanzar" (o drag).
      Barra de stats. Solo admin (ya protegido por proxy).
- [ ] Modal "Procesar item" — **Modo A (curl):** admin pega el curl del BFF API de SHEIN;
      el backend lo PARSEA (no `exec()` — command injection) y hace `fetch()` con esos
      headers para extraer nombre/precio/imagen. **Modo B (manual):** admin llena a mano.
      Campos requeridos para `procesado=true`: nombre + precio_real_usd + imagen.
      (Ver "Curl Parser Contract" en el CEO plan / DESIGN.md.)
- [ ] `POST /api/admin/items/[id]/process`
- [ ] Establecer `total_real_usd` y mover pedido a PRECIO_ACTUALIZADO cuando todos los
      items estén procesados

### ⬜ Fase 5 — Transiciones de estado + notificaciones
- [ ] `PATCH /api/pedidos/[id]/estado` — llama `supabase.rpc('update_order_state')`
      (atómico). Solo admin.
- [ ] Integración Resend + templates de email (7 eventos, ver tabla en DESIGN.md):
      COTIZACION, PRECIO_ACTUALIZADO, PENDIENTE_PAGO, PAGADO, EN_CASILLERO (label "Recibido
      en EE.UU."), ENVIADO_CUBA, DISPONIBLE_ENTREGA
- [ ] Generación de link WhatsApp `wa.me/{phone}?text=...` (phone desde config)
- [ ] Email async tras confirmar el cambio de estado (si falla, el estado igual persiste)

### ⬜ Fase 6 — Config admin
- [ ] `/admin/config` — editar `whatsapp_phone`, `precio_por_lb`, `markup_factor`
      (tabla `config`, RLS admin write). Form simple.

### ⬜ Fase 7 — Preparación de lanzamiento
- [ ] QA pass (/qa) + design review en el sitio live (/design-review)
- [ ] Vercel: configurar env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL = dominio de Vercel)
- [ ] Supabase URL Configuration: Site URL + Redirect URLs con el dominio de prod
- [ ] Habilitar Google OAuth (Google Cloud Console + Supabase) — pasos en SETUP.md
- [ ] Decidir email confirmation ON/OFF (+ SMTP custom con Resend si ON)
- [ ] Merge `feat/foundation-auth` → main, cambiar default branch a main
- [ ] Definir el `whatsapp_phone` real en config antes de lanzar

---

## 6. Decisiones parqueadas (pendientes de la práctica)

- **Pricing express:** NO cerrado. Landing muestra "$7/lb + servicio express (según peso)".
  El fundador hará envíos reales antes de lanzar para definir la tarifa. No hardcodear.
- **Aduana cubana (30%):** decidir si se cobra aparte o se absorbe en el precio.
- **Costo base WeShipYou (dato actual):** 10 lbs = $21.94 (~$2.19/lb), aéreo, 7-10 días.
  Falta la curva exacta de $/lb por peso (de la calculadora logueada).
- **SEO** (metadatos, sitemap): deferido a post-lanzamiento.
- **OG tags dinámicos** en tracking: deferido (evaluar tras primeros 10 pedidos).
- **Multi-admin:** Fase 2 del negocio.

---

## 7. Gotchas (errores que ya resolvimos — no repetir)

- **Push:** usar SSH `github-asareact`, no `gh` (cuenta equivocada).
- **`.npmrc`:** debe fijar registry público o Vercel falla con E401.
- **`proxy.ts`** no `middleware.ts` (Next 16).
- **Bootstrap del primer admin:** el trigger `prevent_role_change()` permite cambios
  cuando `auth.uid()` es null (SQL editor / service_role). Promover con
  `scripts/make-admin.mjs <email>`.
- **Conexión DB:** usar el pooler (`aws-1-us-east-1.pooler.supabase.com:6543`), no la
  directa.
- **`<Reveal>`** (scroll animation) pone opacity:0 hasta entrar al viewport — hay
  fail-safe CSS `@media (scripting: none)` para no-JS.

---

## 8. Referencias

| Archivo | Qué tiene |
|---|---|
| `DESIGN.md` | Sistema de diseño, reglas de negocio, inventario de páginas, navegación, auth, decisiones |
| `SETUP.md` | Env vars, setup de Supabase (email/Google), crear admin, correr el proyecto |
| `supabase/migrations/` | Esquema de DB (3 archivos numerados) |
| `src/lib/types.ts` | Tipos del dominio + `ESTADO_LABEL` (labels visibles al cliente) |
| `landing-wireframe.html` | Wireframe de referencia del landing (diseño) |
| `pages-wireframe.html` | Wireframe de las 7 páginas |
| `~/.gstack/projects/asareact-traelo-app/` | CEO plan, checkpoints, design audits (fuera del repo) |
