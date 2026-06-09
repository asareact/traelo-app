# Traelo — Arquitectura

> Fuente de verdad de **cómo está organizado el código** y **dónde va cada cosa**.
> Léelo antes de crear archivos nuevos. Si vas a romper una regla de aquí, primero
> actualiza este documento.

## Principio base: modular por *features* (vertical slices)

El código se divide en **3 capas** con una **regla de dependencia estricta**:

```
app/  ───importa──▶  features/  ───importa──▶  components/ui · lib · types · config
 (rutas)              (dominio)                 (compartido, sin negocio)
```

- **`app/` solo orquesta.** Una página lee datos del feature y compone componentes.
  Cero lógica de negocio, cero queries SQL sueltas, cero fetch a mano.
- **`features/` es el dominio.** Cada feature es un módulo cerrado: sus reglas,
  sus datos, sus componentes. Un feature **no** importa de otro feature por sus
  archivos internos (si necesita algo, se expone por el `index.ts`).
- **`components/ui`, `lib`, `types`, `config` son la base compartida.** No conocen
  el negocio. Cualquier feature los usa. **Nunca** importan de `features/` ni de `app/`.

La regla en una frase: **las flechas apuntan hacia abajo, nunca hacia arriba.**

## Mapa de carpetas

```
src/
├── app/                          # CAPA RUTAS (delgada)
│   ├── (marketing)/page.tsx      #   /            landing pública
│   ├── (auth)/                   #   /login, /auth/callback, /auth/auth-code-error
│   ├── dashboard/page.tsx        #   /dashboard   (usa <AppShell>)
│   ├── perfil/page.tsx           #   /perfil      (usa <AppShell>)
│   ├── pedidos/
│   │   ├── page.tsx              #   /pedidos      lista (usa <AppShell>)
│   │   ├── nuevo/page.tsx        #   /pedidos/nuevo form (usa <AppShell>)
│   │   └── [id]/page.tsx         #   /pedidos/[id] tracking PÚBLICO (sin shell)
│   ├── layout.tsx · globals.css
│
├── features/                     # CAPA DOMINIO
│   ├── auth/
│   │   ├── actions.ts            #   server actions (login/signup/logout)
│   │   ├── schemas.ts            #   validación zod
│   │   ├── components/           #   UI propia del feature (AuthForm)
│   │   └── index.ts              #   superficie pública del feature (barrel)
│   └── orders/
│       ├── domain/               #   lógica PURA, sin IO (estados, pricing)
│       ├── schemas.ts            #   validación zod (createOrder)
│       ├── queries.ts            #   LECTURA de datos — server-only
│       ├── actions.ts            #   ESCRITURA — server actions
│       ├── components/           #   OrderForm, OrderTracker, OrderCard…
│       └── index.ts              #   barrel CLIENT-SAFE (ver gotcha abajo)
│
├── components/                   # UI COMPARTIDA (sistema de diseño, sin negocio)
│   ├── ui/                       #   primitivas: Button, Input, Field, Card, Alert
│   ├── layout/                   #   AppShell, BottomNav
│   ├── brand/                    #   Logo, Icons
│   └── motion/                   #   Reveal
│
├── lib/                          # INFRA (transversal, sin negocio)
│   ├── supabase/                 #   client · server · admin · middleware
│   ├── utils/                    #   cn, format (dinero/fechas)
│   ├── env.ts                    #   env público validado (zod)
│   └── env.server.ts             #   secretos server-only (service_role)
│
├── types/database.ts             # tipos de filas DB (Profile, Pedido…), sin lógica
├── config/site.ts                # rutas + navegación
└── proxy.ts                      # Next 16: middleware (refresh sesión + guards)
```

## Anatomía de un *feature*

Un feature tiene hasta 5 piezas. Usa solo las que necesite:

| Archivo          | Qué va aquí                                              | `'use client'`? |
|------------------|---------------------------------------------------------|-----------------|
| `domain/*.ts`    | Reglas puras: máquinas de estado, cálculos. Sin IO.     | no (puro)       |
| `schemas.ts`     | Validación zod. Compartida cliente+servidor.            | no              |
| `queries.ts`     | **Lectura** de datos. `import "server-only"`.           | server-only     |
| `actions.ts`     | **Escritura** (`'use server'`). Valida con el schema.   | server          |
| `components/`    | UI del feature. Componen primitivas de `components/ui`. | según el caso   |
| `index.ts`       | Barrel: lo único que otros pueden importar.             | —               |

**Patrón de datos:** `queries.ts` lee, `actions.ts` escribe, `domain/` decide.
Las páginas llaman a queries/actions; nunca tocan Supabase directo para negocio.

## Reglas duras

1. **`app/` no contiene lógica.** Si una página tiene más de ~40 líneas de lógica,
   muévela a un feature.
2. **Nada de SQL/Supabase de negocio fuera de `features/*/queries.ts|actions.ts`.**
   (La auth de sesión en páginas — `getUser()` para el guard — es la excepción.)
3. **Un feature se importa por su barrel** (`@/features/orders`), no por archivos
   internos. Excepción: `queries.ts` se importa directo (ver gotcha).
4. **`components/ui` es agnóstico del negocio.** Un `Button` no sabe qué es un pedido.
5. **Toda entrada de usuario se valida con zod en el server** (action/route), aunque
   ya se valide en el cliente. El cliente es solo UX; el server es la frontera.
6. **El cliente nunca ve "casillero".** Los estados internos se mapean a copy neutral
   en `features/orders/domain/estados.ts`. Es regla de negocio, vive en el dominio.
7. **Mobile-first en todo lo del cliente.** Diseña a 375px y crece hacia arriba.

## Convenciones

- **Imports:** alias `@/*` → `src/*`. Siempre absoluto desde `@/`, salvo dentro del
  mismo feature (relativo `./`).
- **Nombres de archivo:** `kebab-case.tsx`. Componentes en `PascalCase`, hooks `useX`.
- **Estilos:** Tailwind v4 con tokens de `globals.css` (`bg-bg`, `text-primary`,
  `rounded-lg`…). Combina clases con `cn()` de `@/lib/utils/cn`. No `tailwind.config.js`.
- **Server vs Client:** por defecto Server Component. `'use client'` solo cuando hay
  estado/efectos/eventos. Las primitivas con `onChange` son client; las de solo
  pintar son server.
- **Env:** lee de `@/lib/env` (público) o `@/lib/env.server` (secreto). Nunca
  `process.env.X!` suelto.

## Gotchas (que ya nos mordieron)

- **Barrel + `server-only`:** `features/orders/index.ts` exporta componentes
  (algunos client). Por eso **NO** re-exporta `queries.ts` (que es `server-only`):
  si un client component importara el barrel, arrastraría `server-only` y el build
  falla. → Las páginas importan queries directo: `@/features/orders/queries`.
- **Route groups y segmentos repetidos:** Next **no permite** el mismo segmento
  (`pedidos`) en dos ramas de grupo. Por eso `/pedidos/[id]` (público) y `/pedidos`
  (privado) viven en el **mismo** árbol `app/pedidos/`, y el shell mobile se aplica
  como **componente** `<AppShell>` por página, no como layout de grupo.
- **Tracking público:** `/pedidos/[id]` salta RLS a propósito vía el admin client
  (`getPublicPedido`), porque cualquiera con el UUID puede ver el estado (modelo
  tipo "rastrea tu paquete"). El UUID v4 es inadivinable. Para datos filtrados por
  usuario logueado, usa el client RLS (`@/lib/supabase/server`), nunca el admin.
- **Next 16:** `params`/`searchParams` son `Promise` (hay que `await`). El middleware
  se llama `proxy.ts` y exporta `proxy`.
- **Estado inicial del pedido:** `COTIZACION` no se escribe en `estados_pedido` (esa
  tabla es admin-write). El hito inicial se sintetiza desde `pedidos.created_at`.

## Cómo agregar un feature nuevo (receta)

1. `src/features/<nombre>/` con `domain/`, `schemas.ts`, `queries.ts`, `actions.ts`,
   `components/`, `index.ts` (los que apliquen).
2. Tipos de fila DB → `types/database.ts`. Lógica de negocio → `domain/`.
3. Rutas en `app/`, delgadas, importando del barrel del feature.
4. Si es área cliente, envuélvela en `<AppShell>` y agrégala a `config/site.ts`.
5. RLS en la migración correspondiente antes de exponer datos.
