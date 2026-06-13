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

- **Ramas:** `main` (prod) + `develop` (integración), **en sync** (`main` = merge de `develop`).
  Default branch = `main`. Flujo: feature branch desde `develop` → merge a `develop` → `develop` a `main`.
- **Completado y MERGEADO a `main`:** Fase 1 (fundación) + Fase 1.5 (arquitectura modular, ver
  `ARCHITECTURE.md`) + Fase 2 (pedido + tracking + **envío por WhatsApp al admin** + modal confirmar)
  + Fase 3 (dashboard/perfil/nav + dark mode) + **Fase 4** (Kanban admin estilo Trello con
  drag-to-move, procesar items con curl SHEIN → nombre/precio-por-talla/imagen) + **Fase 5 parcial**
  (aviso al cliente por WhatsApp en cada cambio de estado + aviso de cambio de precio; plantillas en
  `features/orders/domain/notificaciones.ts`) + **Fase 6** (`/admin/config`).
- **Extras ya en `main`:** nombre de producto desde el link de SHEIN, copiar link, signup con
  confirmar contraseña, safety-net OAuth; **el cliente puede editar/eliminar su propio pedido
  mientras está en cotización** (COTIZACION/EN_REVISION/PRECIO_ACTUALIZADO; bloqueado de ACEPTADO
  en adelante — editar resetea a COTIZACION y borra el precio del admin); **subir la imagen del
  producto desde el dispositivo** al procesar (admin); peso + evidencia del paquete; persistencia
  de imagen de SHEIN en bucket `productos`; evidencia de precio; limpieza de archivos (CANCELADO inmediato,
  ENTREGADO a los 2 días vía cron `/api/cron/cleanup`). **Rediseño del header** (sticky translúcido,
  logo flotante que sube y se desvanece al scroll, menú hamburguesa lateral, título por ruta, escudo
  admin dentro del menú) + páginas **Sobre nosotros** y **Soporte**. **Página de productos** rediseñada
  (máx 3 en el detalle + `/pedidos/[id]/productos` con imágenes grandes, estilo "playful", precio
  naranja solo ahí). **Inicio enriquecido:** tarjeta de **pedido activo**, **stats** (activos/entregados/
  USD), **cambio del día CUP/MLC** (feature `features/cambio`, API cubanomic con `revalidate:3600`,
  fallback a elTOQUE) + total del pedido también en CUP/MLC. Migraciones **0004 y 0005 ya aplicadas**.
- **Factura de compra (PDF) + loader de marca — NUEVO:** el admin genera una **factura PDF
  descargable** desde el kanban (botón "Generar factura", solo `PAGADO`+) vía `@react-pdf/renderer`
  (feature `features/invoice`, ruta `/api/admin/factura/[pedidoId]`, runtime node). Logo + español +
  **miniatura del producto** (mime detectado por magic-bytes, NO por el `Content-Type` que SHEIN miente:
  sirve JPEG desde URLs `.png`), desglose que SIEMPRE suma al total, **"Envío: Por confirmar"** cuando el
  paquete aún no se ha pesado (en vez de un engañoso $0.00, porque el botón sale en PAGADO y el peso se
  registra en EN_CASILLERO), **nota de política de reembolso** (`config/business.ts`), fetch de imagen con
  timeout 5s + log estructurado `factura.generada`. Sin casillero/SHEIN. **El splash de la landing pasó de
  video a un loader CSS** hecho con el propio logo (la flecha teal se dibuja sola, fondo `surface` como las
  cards), `components/motion/logo-loader.tsx`; `public/intro.mp4` quedó sin referenciar.
- **LANZADO:** prod está vivo y validado con un pedido real de punta a punta (env vars de
  Supabase + `NEXT_PUBLIC_SITE_URL`, Supabase URL Config, `whatsapp_phone` real y Google OAuth
  ya funcionan; hay usuarios registrados).
- **Próximo (nada bloquea, todo es pulido):** `CRON_SECRET` cuando se acerque el primer pedido
  entregado (el cron corre a los 2 días); decidir email confirmation; montar tests (no existen
  aún); QA/design-review en vivo. Opcional: Fase 5 restante (emails Resend, notif in-app
  marcar leídas) e "Inicio Ola 3" (prueba social real + referidos, ver §6).
- **Arquitectura:** modular por features. **Lee `ARCHITECTURE.md` antes de tocar código.**
- **Modelo de envío del pedido:** al confirmar, se guarda en DB + se abre WhatsApp prellenado
  al admin (`config.whatsapp_phone` = 5358260354). Plantillas en
  `features/orders/domain/notificaciones.ts`; helper de link en `lib/whatsapp.ts`.
- **Storage:** buckets públicos `evidencias` (peso) y `productos` (imagen + evidencia de
  precio). Solo admin escribe. `CRON_SECRET` requerido en Vercel para el cron de limpieza.
- **Cambio del día:** feature `features/cambio` consume la API de cubanomic (USD.CUP / MLC.CUP
  median, MLC a razón del USD = usdCup/mlcCup) con `revalidate:3600`. Token con default en
  `env.server.ts` (`CUBANOMIC_TOKEN`, opcional override en Vercel). Si el feed cae → fallback a
  elTOQUE (`https://eltoque.com/tasas-de-cambio-cuba`).
- **Primer admin:** `asarria952807@gmail.com` (rol admin en DB).
- **Prod (Vercel `traelo-cu.vercel.app`):** requiere `NEXT_PUBLIC_SITE_URL=https://traelo-cu.vercel.app`
  (sin `/`) + `CRON_SECRET` (cron de limpieza) + Production Branch = `main`. Supabase URL Config
  (allowlist `/auth/callback`) ya puesto. Falta verificar esas env/config en Vercel para el OAuth.
- **Gotcha de entorno:** usar **Node 18+** (con Node 14 el dev revienta, ver sección 7).

---

## 3. Stack y convenciones CRÍTICAS (Next 16 es nuevo — no asumas patrones viejos)

> **Estructura del código:** ver `ARCHITECTURE.md`. Resumen: modular por *features*
> (`app/` → `features/` → `components/ui · lib · types · config`, flechas hacia abajo).
> Lectura en `features/*/queries.ts` (server-only), escritura en `actions.ts`
> (`'use server'`), lógica pura en `domain/`. Validación zod en el server siempre.
> Área cliente mobile-first envuelta en `<AppShell>` (bottom-nav). Primitivas UI en
> `components/ui` con `cn()`. Auth: `features/auth`. Pedidos: `features/orders`.

- **Next.js 16** (App Router) + **React 19** + **Tailwind v4** + **zod** (validación)
- **Tailwind v4:** los design tokens van en `@theme` dentro de `src/app/globals.css`.
  **NO hay `tailwind.config.js`.** Utilidades: `bg-bg`, `bg-surface`, `text-primary`,
  `text-accent`, `text-muted`, `border-border`, `rounded-md/lg/full`, `font-display`
  (Fraunces), `font-sans` (Plus Jakarta).
- **Middleware → Proxy:** Next 16 renombró `middleware` a **`proxy`**. El archivo es
  `src/proxy.ts` (exporta `proxy`). El helper de sesión está en `src/lib/supabase/middleware.ts`.
- **params / searchParams son Promises** → hay que `await`-earlos.
- **Supabase (`@supabase/ssr`):**
  - `src/lib/supabase/client.ts` — cliente browser (Client Components)
  - `src/lib/supabase/server.ts` — `createClient()` (server, async, usa cookies, RLS)
  - `src/lib/supabase/admin.ts` — `createAdminClient()` (service_role, `server-only`,
    bypassa RLS; usado p.ej. en el tracking público por UUID)
  - Claves nuevas: `sb_publishable_` (anon) y `sb_secret_` (service_role)
  - Env: leer de `@/lib/env` (público) o `@/lib/env.server` (secreto), validado con zod.
- **Auth:** email/password + Google OAuth. Feature en `src/features/auth/` (actions +
  schemas + `AuthForm`). Callback OAuth en `src/app/(auth)/auth/callback/route.ts`.
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
5. **Antes de commitear:** corre `npm run lint` + `npx tsc --noEmit` (NO `npm run build`
   con el dev levantado — comparten `.next` y corrompe el dev server de Turbopack). Sigue
   `DESIGN.md` para todo lo visual. Un commit por cambio lógico.
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

### ✅ Fase 2 — Formulario de pedido + tracking público (DONE)
- [x] `/pedidos/nuevo` — formulario multi-item (URL SHEIN + talla + color + cantidad
      + notas, stepper, "Agregar otro producto"). Mobile-first. Requiere auth.
      → `features/orders/components/order-form.tsx`
- [x] Server action `createOrder` — crea `pedido` (COTIZACION) + `pedido_items` vía
      cliente RLS (cliente dueño), con rollback si fallan los items. Valida con zod.
      → `features/orders/actions.ts`
- [x] `/pedidos/[id]` — **tracking público SIN auth** (admin client por UUID).
      Tracker de 6 hitos + lista de productos + timeline. Standalone (sin bottom-nav).
      → `app/pedidos/[id]/page.tsx`, `features/orders/components/order-tracker.tsx`
- [x] Redirect tras crear pedido → `/pedidos/[id]?nuevo=1` (banner de confirmación)
- [x] **Modal de confirmación** al enviar ("¿Esto es todo?"). **Confirmar = enviar:**
      un solo botón verde "Enviar por WhatsApp" guarda el pedido (DB, para tracking)
      Y abre WhatsApp prellenado al admin (`config.whatsapp_phone` = 5358260354) con el
      pedido completo + link de seguimiento. El id se genera en cliente para el link.
      `lib/whatsapp.ts` (plantilla `pedidoParaAdmin`), `components/ui/modal.tsx`.
- [x] **"Copiar link"** en el tracking — `components/ui/copy-link-button.tsx`.
- [x] **CRUD del cliente:** editar/eliminar el pedido propio mientras está en cotización
      (`permiteEdicionCliente` en `domain/estados.ts`). Acciones en el detalle (`OrderActions`)
      y en las cards de `/pedidos` y `/rastreo` (`OrderCardActions`, lápiz/papelera con
      **lucide-react**, superpuestas como hermanas del `<Link>` para no anidar botón en anchor).
      Solo dueño, nunca en el tracking público. Editar reutiliza `OrderForm` (`mode="edit"`,
      prefill) → `updateOrder` (reemplaza items + resetea a COTIZACION + limpia total). Eliminar
      → `deleteOrder` (cascade). Ambas validan propiedad + estado vía admin client (trust
      boundary; sin abrir RLS de delete/update al cliente).
- [x] Verificación visual con browser headless (capturas en claro/oscuro).
- [ ] Tests (form validation, creación de pedido, RLS aislamiento) — PENDIENTE
      (falta montar framework de tests, p.ej. vitest + playwright).

### ✅ Fase 3 — Dashboard cliente + perfil + nav (DONE — adelantado en este bloque)
- [x] `/dashboard` — saludo + CTA "Hacer un pedido" + pedidos recientes (3) con badges.
      → `app/dashboard/page.tsx`
- [x] `/perfil` — **editable** (nombre, teléfono, dirección) + correo + cerrar sesión.
      Feature `features/profile/` (domain/schema/query/action/form).
- [x] **Gate de pedido:** para crear un pedido el perfil debe tener nombre + teléfono
      (dirección opcional). Se exige en `/pedidos/nuevo` (página) y en `createOrder`
      (server, defensa en profundidad) → redirige a `/perfil/completar?next=…`.
      Aviso en el dashboard si el perfil está incompleto.
- [x] `BottomNav` (móvil, 5 tabs): Inicio · Pedidos · **Pedir** (CTA central
      animado) · Rastreo · Perfil. Footer blanco opaco, botón central con borde.
      → `components/layout/bottom-nav.tsx` + `<AppShell>` (con `AppHeader`: logo + campana)
- [x] Badge de estado reutilizable (`EstadoBadge`, tinte por hito/terminal).
- [x] `/pedidos` — lista completa de pedidos del cliente con empty state.
- [x] **Rediseño dashboard** ("Verano Confiable"): welcome serif, aviso de perfil
      teal, CTA grande, empty state con caja punteada.
- [x] `/rastreo` — **rediseño**: todos los pedidos (entregados/cancelados atenuados),
      `OrderCard` con badge de hito + fecha relativa ("Hoy, 11:16").
- [x] `/pedidos/[id]` — **rediseño detalle**: stepper numerado en tarjeta, productos,
      **costo del pedido** (subtotal/envío/total con aviso si falta precio), historial
      con íconos. Página **adaptativa**: con sesión usa `<AppShell>` (nav + flecha);
      público (link compartido) usa header standalone. `OrderDetail` + `CostSummary`.
- [x] `/notificaciones` — lista (tabla `notificaciones`, RLS) + empty state.
      Feature `features/notifications/`. Campana en el header enlaza aquí.
- [x] **Dark mode ("Luxury Dark")** con toggle claro/oscuro en el header (persiste,
      sin parpadeo). Tokens en `.dark`, landing forzada a `.light`. CTA y botón central
      con tratamientos `dark:`. `components/theme/theme-toggle.tsx`. Verificado por capturas.
- [x] Stats (activos / entregados / USD gastado) — grid en el Inicio + tarjeta de pedido activo.
- [x] **Cambio del día CUP/MLC** en el Inicio (feature `features/cambio`, fallback a elTOQUE).
      (Notificaciones: marcar leídas / badge de no-leídas → se sigue en Fase 5, no duplicar aquí.)

### ✅ Fase 3.6 — Rediseño de header + páginas + cambio del día (DONE, en `main`)
- [x] **Header sticky** translúcido, altura fija, sin línea de borde. Logo **flota** sobre
      header/body y al hacer scroll **sube y se desvanece** (sin estado final "colapsado"
      buggy). Footer (bottom-nav) y menú vía **portal a `document.body`** (escapa el
      containing-block de transforms). → `components/layout/sticky-header.tsx` + `header-nav.ts`.
- [x] **Menú hamburguesa lateral** (panel drawer) solo en páginas principales; **botón back**
      en secundarias. Título por ruta en el nav (saludo en Inicio, nombre de página en el resto;
      sin h1/saludo duplicados en el body). Escudo de admin movido al menú.
      → `components/layout/menu-drawer.tsx`.
- [x] Páginas **Sobre nosotros** (`/sobre-nosotros`) y **Soporte** (`/soporte`, botón WhatsApp + FAQ).
- [x] **Página de productos:** máx 3 en el detalle + `/pedidos/[id]/productos` con imágenes grandes
      (estilo "playful", precio naranja solo ahí). "Ver detalles" (≤3) / "Ver todos (N)" (>3).
- [x] **Cambio del día** (feature `features/cambio`) en Inicio + total del pedido en CUP/MLC.

### ✅ Fase 4 — Admin Kanban + procesar items (DONE, en `main`)
- [x] `/admin/kanban` — columnas por estado (una por estado con pedidos, scroll horizontal),
      cards de pedido con cliente + contacto + items procesados + total, control "Avanzar"
      (select de estado → RPC atómico `update_order_state`). Barra de stats. **Desktop-first**
      (navbar oscuro sticky + `max-w-1200`). Solo admin (proxy + guard en el layout).
      → `features/admin/` (queries server-only, actions, domain `kanban.ts`/`curl.ts`,
        schemas zod, components). `app/admin/{layout,page,kanban/page}.tsx`.
- [x] Modal "Procesar item" — **Modo A (curl):** admin pega "Copy as cURL" de SHEIN; el
      backend lo **PARSEA** (`domain/curl.ts`, tokenizer propio, **nunca `exec()`**) con guard
      SSRF (solo https + host SHEIN), hace `fetch()` y extrae nombre/precio/imagen (deep-scan
      defensivo). **Modo B (manual):** campos editables. El admin revisa antes de guardar.
      Requeridos para `procesado=true`: nombre + precio_real_usd + imagen (zod).
- [x] `POST /api/admin/items/[id]/process` — verifica admin, parsea curl, fetch a SHEIN,
      devuelve los datos extraídos (no escribe DB; el guardado va por la server action
      `processItem`, que es el trust boundary).
- [x] Establecer `total_real_usd` (suma precio_real × cantidad) y mover a PRECIO_ACTUALIZADO
      vía RPC cuando todos los items quedan procesados (solo desde COTIZACION/EN_REVISION).
- [x] Validado el mapeo del curl con una respuesta REAL de SHEIN (nombre + precio-por-talla +
      og:image, reutilizando `cf_clearance` para `get_goods_detail_static_data`).
- [x] Prueba E2E en prod con un cliente real (un amigo): pedido completo de punta a punta.
      De ahí salió el fix del peso (el envío no se sumaba al total) → arreglado en `20dea4f`.

### 🟦 Fase 5 — Transiciones de estado + notificaciones (WhatsApp DONE; emails pendientes)
- [x] Transición de estado atómica vía RPC `update_order_state` (desde el Kanban admin, solo admin).
- [x] **Aviso al cliente por WhatsApp** en cada cambio de estado (opcional, decisión del admin):
      plantillas por estado destino en `features/orders/domain/notificaciones.ts` (nombres de
      producto + talla/color + link de tracking `https` + peso/valor; **nunca** links de SHEIN).
- [x] **Aviso de cambio de precio** ("recuerda pagar") cuando se actualiza precio + evidencia.
- [x] **Aviso de peso por WhatsApp** al registrar/corregir el peso: el modal de peso ofrece
      enviar al cliente el peso + costo final desglosado (Productos / Envío / Total a pagar),
      con botón "No notificar". Plantilla `mensajePeso` en `notificaciones.ts`.
- [ ] Integración Resend + templates de email (7 eventos, ver tabla en DESIGN.md) — opcional,
      si se quiere además del WhatsApp.
- [ ] Notificaciones in-app: marcar leídas / badge de no-leídas.

### ✅ Fase 6 — Config admin (DONE, en `main`)
- [x] `/admin/config` — editar `whatsapp_phone`, `precio_por_lb`, `markup_factor`
      (tabla `config`, RLS admin write). → `features/admin/components/config-form.tsx`.

### 🟦 Fase 7 — Preparación de lanzamiento (prod YA funciona — E2E real pasó)
> **Prod está vivo y validado:** un pedido real (un amigo como cliente) pasó de punta a
> punta en prod, lo que confirma que el deploy en Vercel, las env vars de Supabase +
> `NEXT_PUBLIC_SITE_URL`, la Supabase URL Config y el `whatsapp_phone` real ya están bien.
- [x] Vercel: env vars de Supabase (URL, anon, service_role) + `NEXT_PUBLIC_SITE_URL`.
- [x] Supabase URL Configuration (Site URL + Redirect URLs con el dominio de prod).
- [x] `whatsapp_phone` real en config (el pedido E2E llegó al WhatsApp del admin).
- [x] Merge a `main` + default branch = `main` (flujo `develop` → `main`).
- [x] Habilitar Google OAuth — **funciona en prod** (hay usuarios registrados por Google).
- [ ] `CRON_SECRET` en Vercel para el cron de limpieza (`/api/cron/cleanup`) — **no urgente**:
      el cron solo corre 2 días después de entregar, y aún no hay pedidos cerrados. Verificar
      cuando se acerque el primer pedido entregado.
- [x] Email confirmation: **decidido OFF**. Agrega fricción para audiencia WhatsApp-first y los
      de Google ya vienen verificados. Encenderla recién cuando haya **dominio propio** (ahí se
      conecta Resend, free tier 3k/mes, y se verifica SPF/DKIM). El SMTP integrado de Supabase
      es solo para pruebas (rate-limit bajo + cae en spam).
- [ ] QA pass (/qa) + design review en el sitio live (/design-review) — opcional pero recomendado.

---

## 6. Decisiones parqueadas (pendientes de la práctica)

- **Costo real de WeShipYou (ESTUDIADO — calculadora real, 12 pesos de 1 a 100 lb, jun 2026).**
  El viejo dato de "10 lb = $21.94" estaba MAL (era marítimo o promo, no el aéreo). Fórmula real
  del envío aéreo a Cuba (sobre **peso facturable** = peso real + 0.7 lb de ajuste, o el volumétrico
  si el bulto es voluminoso/liviano — ojo con ropa inflada):
  - **Estándar ≈ $10 base + $3.56/lb** (5-15 días). Validado con error 1-7%. Para pesos exactos en
    8-15 lb conviene interpolar entre puntos medidos (la recta plana corre ~6% baja ahí).
  - **Express = Estándar + $1.15/lb** (3-7 días), CLAVADO para **≥5 lb**. Abajo de 5 lb el recargo
    es irregular ($3.4-$5.8, ruido del calculador) — no aplica porque el express se ofrece solo 10+ lb.
  - El $/lb que muestra la app es `total ÷ peso`: baja con el peso porque la base (~$10) se diluye.
    Se aplana en ~$3.65/lb de 50 lb para arriba. **Aranceles aparte** (los paga el cliente al recibir).
- **Pricing al cliente — $7/lb FIJO (estándar), modelo cerrado.** En Cuba se cobra precio fijo por
  libra (no variable como WeShipYou). A $7/lb fijo, contra el costo real ($10 + $3.56/lb):
  - **Tu margen ≈ $3.4/lb** en envíos medianos/grandes (sube con el peso). **Break-even ~3 lb.**
  - **Consolidás** (varios pedidos en UN solo envío del negocio → la base de $10 se paga una vez y
    se reparte): cada libra extra cuesta ~$3.56, cobrás $7 → ~$3.4/lb limpio. Por eso un pedido
    chico NUNCA va solo (1 lb solo = pérdida $10.47 vs $7; consolidado = +$3.44). Sin mínimo de pedido.
  - Tabla ref (cliente $7/lb · costo real · ganancia): 5lb $35/$27.81/**+$7** · 15lb $105/$68.11/**+$37**
    · 30lb $210/$113/**+$97** · 50lb $350/$184.58/**+$165** · 100lb $700/$368.97/**+$331**.
- **Express del negocio — IMPLEMENTADO (con tipo de envío real).** Modelo: $7/lb base **+ recargo
  express por libra** (`config.recargo_express_por_lb`, default **2.65** = ~$1.15 reembolso WSY +
  ~$1.50 fee). Solo para **10+ lb** (`PESO_MIN_EXPRESS` en `domain/pricing.ts`). El cliente paga el
  peso **real** de la balanza que registra el admin (lo ve pesar); no se usa peso facturable de WSY.
  - **Columna `pedidos.tipo_envio`** (`estandar`|`express`, default `estandar`, migración 0006 aplicada).
  - **Flujo:** al pesar 10+ lb, `mensajePeso` OFRECE el express por WhatsApp con desglose. Si el
    cliente acepta, el admin lo marca con el **toggle Estándar/Express en la tarjeta del kanban**
    (`setTipoEnvio` action) → recalcula `total_real_usd` = productos + envío + recargo, y guarda el tipo.
    Re-pesar un pedido express mantiene el recargo (`registrarPeso` lee el `tipo_envio` actual).
  - **Reflejo:** badge "Express" + total actualizado en la tarjeta admin; "Envío express a Cuba" en el
    `CostSummary` del cliente; "Envío express" en la plantilla del peso. Recargo editable en `/admin/config`.
  - Helpers: `totalPedidoConTipo`, `recargoExpress`, `aplicaExpress`, type `TipoEnvio` en `domain/pricing.ts`.
- **Aduana cubana (~35%):** los aranceles los estima WeShipYou y **los paga el cliente al recibir**
  (no es costo del negocio). Ej. real: $26 sobre $73 declarado (12 lb), $37 sobre 20 lb. Decidir si
  se le comunica al cliente por adelantado en la plantilla.
- **SEO** (metadatos, sitemap): deferido a post-lanzamiento.
- **OG tags dinámicos** en tracking: deferido (evaluar tras primeros 10 pedidos).
- **Factura — guardar el recargo express en el pedido (no recalcularlo).** Hoy `desgloseFactura`
  recompone el recargo desde `config.recargo_express_por_lb` actual; si cambias esa tarifa después,
  la repartición envío/recargo de una factura vieja se desvía (el total se mantiene: es el valor
  guardado). Baja probabilidad. Fix robusto: persistir el recargo cobrado en `pedidos`. (P3)
- **Factura — redondear el subtotal antes de restar el envío** en `desgloseFactura`: hoy el subtotal
  entra sin `toFixed(2)` a la resta, posible descuadre visual de 1 centavo. Cosmético. (P3)
- **Multi-admin:** Fase 2 del negocio.
- **App móvil / distribución (decidido el camino, sin construir aún):** NO Flutter. Estrategia:
  **una sola PWA** (reusa el código actual) → si se quiere un "APK descargable" para Android,
  empaquetar la misma PWA como **TWA con Bubblewrap** (un artefacto, no un segundo código) →
  Flutter solo si se choca con una pared concreta que la PWA/TWA no resuelva. Razonamiento:
  en Cuba el cuello de botella es la distribución, no el cliente; el App Store de iOS está
  capado para Apple IDs cubanas (→ PWA es la única vía "app" en iOS), y en Android la norma es
  el APK directo, que el TWA cubre. La PWA es más fuerte justo en Android y más débil en iOS,
  así que un nativo solo-Android sería pagar doble código por donde la PWA ya rinde.
  Prerrequisitos para encenderla bien (hoy faltan): **service worker** (no existe), íconos PNG
  192/512 + apple-touch-icon (hoy solo `icon.svg`). Recomendado **@serwist/next** (sucesor de
  next-pwa, compatible con Next 16; probar con `next build`+`next start`, no en el dev de Turbopack).
- **Push notifications (atado a la PWA de arriba):** Android = push completo como cualquier app
  (Web Push, app cerrada/2.º plano). iOS = funciona desde iOS 16.4 **solo con la PWA instalada
  en la pantalla de inicio**, algo menos confiable. Requiere el service worker + backend de
  suscripciones (tabla en Supabase + Edge Function con claves VAPID, o un servicio tipo OneSignal).
  Verlo como **complemento** del WhatsApp, no reemplazo: en Cuba WhatsApp tiene más alcance
  (cualquier teléfono, sin instalar).

---

## 7. Gotchas (errores que ya resolvimos — no repetir)

- **Push:** usar SSH `github-asareact`, no `gh` (cuenta equivocada).
- **No `npm run build` con el dev levantado:** comparten la carpeta `.next` y el build
  corrompe el servidor de Turbopack (deja de reflejar cambios). Para verificar antes de
  commitear usa `npm run lint` + `npx tsc --noEmit`. Si ya se corrompió: mata el puerto
  3000, borra `.next` y reinicia `npm run dev`.
- **`.npmrc`:** debe fijar registry público o Vercel falla con E401.
- **`proxy.ts`** no `middleware.ts` (Next 16).
- **Bootstrap del primer admin:** el trigger `prevent_role_change()` permite cambios
  cuando `auth.uid()` es null (SQL editor / service_role). Promover con
  `scripts/make-admin.mjs <email>`.
- **Conexión DB:** usar el pooler (`aws-1-us-east-1.pooler.supabase.com:6543`), no la
  directa.
- **`<Reveal>`** (scroll animation) pone opacity:0 hasta entrar al viewport — hay
  fail-safe CSS `@media (scripting: none)` para no-JS.
- **Node 18+ obligatorio (usa 20/22):** con **Node 14** el dev de Turbopack
  revienta procesando `globals.css` → `SyntaxError: Unexpected token '??='` /
  el overlay muestra "Jest worker encountered child process exceptions". El
  `node --version` debe ser ≥18. Si usas nvm, fija la versión correcta.
- **`position: fixed` y `transform` (regla de oro):** ningún ancestro del bottom
  nav (ni de un modal/overlay) puede tener `transform`, o el `fixed` se ancla a
  ESE ancestro en vez del viewport y "se despega". Ojo: `animation-fill-mode:
  both`/`forwards` deja el transform *aplicado de forma permanente* (no solo
  durante la animación), así que el nav quedaba atrapado en TODAS las páginas, no
  solo al navegar. Por eso: el wrapper de transición (`.page-enter`) es **fade
  puro sin transform**, y el "rise" característico vive en `.content-enter` sobre
  `<main>` (que NO contiene al nav — el nav es su hermano). El `.content-enter`
  usa `backwards` (no `both`) para soltar el transform al terminar y no atrapar
  modales abiertos después. Mismo principio: el intro vive en el root layout,
  fuera del subárbol transformado.
- **Dark mode / Tailwind v4:** `dark:` se cablea a la clase `.dark` vía
  `@custom-variant dark (&:where(.dark, .dark *))` en `globals.css`. Si editas ese
  directivo (o `@theme`) **reinicia `npm run dev`** — Turbopack a veces no recompila
  ese cambio y `dark:` se queda en `prefers-color-scheme` (los estilos dark se
  disparan en claro si tu SO está en oscuro). El build de producción siempre es correcto.

---

## 8. Referencias

| Archivo | Qué tiene |
|---|---|
| `DESIGN.md` | Sistema de diseño, reglas de negocio, inventario de páginas, navegación, auth, decisiones |
| `SETUP.md` | Env vars, setup de Supabase (email/Google), crear admin, correr el proyecto |
| `ARCHITECTURE.md` | **Cómo está organizado el código** (capas, features, reglas, gotchas, receta) |
| `supabase/migrations/` | Esquema de DB (3 archivos numerados) |
| `src/types/database.ts` | Tipos de filas DB (Profile, Pedido, PedidoItem…), sin lógica |
| `src/features/orders/domain/estados.ts` | Máquina de estados + `ESTADO_LABEL` + hitos cliente (sin "casillero") |
| `landing-wireframe.html` | Wireframe de referencia del landing (diseño) |
| `pages-wireframe.html` | Wireframe de las 7 páginas |
| `~/.gstack/projects/asareact-traelo-app/` | CEO plan, checkpoints, design audits (fuera del repo) |
