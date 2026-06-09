# Design System — Traelo

## Product Context
- **What this is:** Plataforma web de gestión de pedidos SHEIN enviados a Cuba. Clientes pegan links de SHEIN, el admin procesa y notifica precios reales, los clientes siguen el estado hasta la entrega.
- **Who it's for:** Cubanos (dentro y fuera de Cuba), principalmente mujeres jóvenes 18-30 años, mobile-first, llegando desde Facebook/WhatsApp.
- **Space/industry:** Logística de encargos, remesas/diáspora cubana, moda internacional.
- **Project type:** Web app — portal cliente (mobile-first) + Kanban admin (desktop-first) + landing page + tracking público.

---

## Aesthetic Direction
- **Direction:** Warm Digital — editorial latinoamericana. La confianza de una boutique profesional con la cercanía de un DM de tu amiga más estilosa.
- **Decoration level:** Intentional — las imágenes de producto son el protagonista visual. Textura sutil de fondo. Sin blobs decorativos, sin gradientes genéricos.
- **Mood:** Arena, sol, verano cubano. Terracota como color de acción. Teal solo para estados confirmados (señal de confianza ganada).
- **Anti-slop rules:** Sin gradientes púrpura/violeta. Sin grillas de 3 columnas con íconos en círculos de colores. Sin centrado uniforme de todo. Sin border-radius burbujeante en todos los elementos.

---

## Typography

- **Display / Hero:** [Fraunces](https://fonts.google.com/specimen/Fraunces) — variable serif contemporáneo. Seguridad editorial sin pretensión europea. Para headlines principales, nombre del negocio, anuncios de estado importantes.
- **Body / UI:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — geométrico, limpio, excelente legibilidad en móvil desde 12px. Para todo el texto funcional: labels, botones, body copy, formularios.
- **Data / Números:** Plus Jakarta Sans con `font-variant-numeric: tabular-nums` — para precios, IDs de pedido, contadores.
- **Code:** No aplica al MVP.
- **Loading:** Google Fonts CDN.
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```
- **Scale:**
  ```
  hero:    clamp(36px, 6vw, 56px) / Fraunces 700-800 / line-height 1.05
  h1:      clamp(28px, 4vw, 40px) / Fraunces 700 / line-height 1.1
  h2:      24px / Fraunces 600 / line-height 1.2
  h3:      18px / Fraunces 600 / line-height 1.3
  body:    16px / Plus Jakarta Sans 400 / line-height 1.65
  sm:      14px / Plus Jakarta Sans 400 / line-height 1.6
  label:   12px / Plus Jakarta Sans 700 / letter-spacing 0.5px
  caption: 11px / Plus Jakarta Sans 600 / letter-spacing 1px / UPPERCASE
  ```

---

## Color

- **Approach:** Restrained — un primario, un acento con significado específico, neutros cálidos.
- **Primary:** `#C4522A` — Terracota. Color de acción: CTAs, botones principales, estado actual en el tracking. Transmite energía sin agresividad.
- **Accent (Confianza):** `#00B5A0` — Teal. **Solo para estados confirmados positivos** (PAGADO, ENTREGADO, ACEPTADO). El cliente asocia este color con "algo bueno pasó". Nunca usarlo como decoración general.
- **Background:** `#FAFAF7` — Blanco arena. Evita el blanco puro que se siente clínico.
- **Surface:** `#F0EBE0` — Arena suave. Para cards, inputs, paneles secundarios.
- **Border:** `#E2D9CE` — Borde cálido.
- **Text:** `#1C1714` — Negro cálido. Nunca negro puro.
- **Muted:** `#8C7F76` — Gris cálido. Para texto secundario, labels, placeholders.
- **Semantic:**
  - Success: `#00B5A0` (mismo que accent)
  - Warning: `#D4A017`
  - Error: `#B03A2E`
  - Info: `#1E65A8`
- **Dark mode ("Luxury Dark"):** lienzo near-black, superficies neutras cálidas, los
  acentos terracota + teal resaltan. Toggle claro/oscuro en el `AppHeader` (persiste en
  localStorage, aplicado pre-paint para no parpadear). Se activa con la clase `.dark` en
  `<html>` (Tailwind v4: `@custom-variant dark`). La landing se mantiene clara (clase
  `.light`). Implementado en `src/app/globals.css` + `components/theme/theme-toggle.tsx`.
  ```css
  .dark {
    --color-bg:      #070706;
    --color-surface: #161412;
    --color-text:    #F4F1EC;
    --color-muted:   #908A83;
    --color-border:  #272320;
  }
  ```
  Tratamientos específicos de dark vía `dark:` utilities: el CTA "Hacer un pedido" pasa
  de terracota sólido a tarjeta con borde-degradado; el botón central del nav pasa de
  relleno a contorneado en terracota.

### CSS Custom Properties (copiar en globals.css)
```css
:root {
  --bg:       #FAFAF7;
  --surface:  #F0EBE0;
  --primary:  #C4522A;
  --accent:   #00B5A0;
  --text:     #1C1714;
  --muted:    #8C7F76;
  --border:   #E2D9CE;
  --error:    #B03A2E;
  --warning:  #D4A017;
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-full: 9999px;
}
```

---

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable (mobile-first — tap targets generosos)
- **Scale:**
  ```
  2xs:  2px
  xs:   4px
  sm:   8px
  md:   16px
  lg:   24px
  xl:   32px
  2xl:  48px
  3xl:  64px
  4xl:  96px
  ```
- **Tap targets:** Mínimo 44px de altura para todos los elementos interactivos en móvil.

---

## Layout

- **Approach:** Híbrido — mobile-first single-column para portal cliente, desktop-first para admin Kanban.

### Portal cliente (`/`, `/pedidos/*`, `/dashboard`)
- Mobile-first, single column.
- Sin sidebar. Sin navegación lateral.
- Max content width: 480px centrado.
- Full-bleed en imágenes hero y cards de tracking.
- Scroll-driven — la información aparece en el orden correcto verticalmente.

### Admin (`/admin/*`)
- Desktop-first. El Kanban requiere múltiples columnas.
- Max content width: 1200px.
- Layout: sidebar de navegación + contenido principal.
- Las columnas del Kanban tienen scroll horizontal en viewports pequeños.

### Grid
```
Mobile  (< 640px):  1 columna, padding 16px
Tablet  (640-1024px): 2 columnas donde aplica, padding 24px
Desktop (> 1024px): layout específico por sección, padding 32px
```

- **Border radius:** Jerárquico.
  ```
  Botones pequeños, badges:  var(--radius-full) — totalmente redondeado
  Cards, inputs, modales:    var(--radius-md) — 12px
  Secciones grandes, hero:   var(--radius-lg) — 20px
  ```

---

## Motion

- **Approach:** Minimal-funcional — solo transiciones que ayudan a comprender qué cambió.
- **Easing:**
  - Enter (aparece): `ease-out` — arranca rápido, termina suave.
  - Exit (desaparece): `ease-in` — arranca suave, termina rápido.
  - Move (se mueve): `ease-in-out` — suave en ambos extremos.
- **Duration:**
  ```
  micro:   50-100ms  — hover states, small transitions
  short:   150-200ms — button press, badge change
  medium:  250-350ms — card entrance, modal open
  long:    400-600ms — page transition, estado change en tracking
  ```
- **Transiciones de estado en tracking:** Cuando cambia un estado (COTIZACION → EN_REVISION), el dot del timeline se anima de gris a teal/primary con `transition: background 400ms ease-out, box-shadow 400ms ease-out`.

---

## Component Rules

### Botones
- **Primary:** Background `var(--primary)`, texto blanco, `border-radius: var(--radius-full)`.
- **Secondary:** Background `var(--surface)`, border `var(--border)`, texto `var(--text)`.
- **Accent:** Background `var(--accent)`, texto blanco. Solo para acciones de confirmación positiva.
- **Ghost:** Border `var(--primary)`, texto `var(--primary)`, background transparente.
- **Padding:** `11px 22px` (md) / `8px 16px` (sm) / `14px 28px` (lg).
- **Disabled:** opacity 0.5, cursor not-allowed.

### Forms
- Label: `12px / Plus Jakarta Sans 700 / UPPERCASE / letter-spacing: 0.5px / color: var(--muted)`.
- Input: border `1.5px solid var(--border)`, focus: border `var(--primary)`, error: border `var(--error)`.
- Placeholder: `color: var(--muted)`.

### Estado badges (Kanban + Tracking)
```
COTIZACION:       bg #FFF3E0, text #B45309
EN_REVISION:      bg #EDE9FE, text #5B21B6
PRECIO_ACTUALIZADO: bg #FEF3C7, text #92400E
ACEPTADO:         bg #D1FAE5, text #065F46
PENDIENTE_PAGO:   bg #DBEAFE, text #1E40AF
PAGADO:           bg rgba(0,181,160,0.12), text var(--accent)
COMPRADO_SHEIN:   bg #DBEAFE, text #1E40AF
EN_CAMINO_*:      bg #DBEAFE, text #1E40AF
EN_CASILLERO:     bg #DBEAFE, text #1E40AF
CONSOLIDANDO:     bg #DBEAFE, text #1E40AF
ENVIADO_CUBA:     bg #EDE9FE, text #5B21B6
EN_TRANSITO_*:    bg #EDE9FE, text #5B21B6
DISPONIBLE_*:     bg #D1FAE5, text #065F46
ENTREGADO:        bg #D1FAE5, text #065F46
CANCELADO:        bg #FEE2E2, text #991B1B
```

### Tracking timeline dots
- Pendiente: `background: var(--border)`.
- Completado: `background: var(--accent)`.
- Estado actual: `background: var(--primary); box-shadow: 0 0 0 4px rgba(196,82,42,0.2)`.

---

## Business Rules (Pricing & Logistics)

### Precios de envío
- **Precio base:** $7.00 USD por libra
- **Mínimo:** artículos que pesan menos de 1 lb se cobran como 1 lb completa
- **Descuento:** pedidos de más de 10 lbs reciben descuento (porcentaje a definir por el admin)
- **Express:** disponible solo para pedidos de 10+ lbs. Tiempo Cuba: 5-7 días vs 7-15 estándar

### Tiempos de entrega (estimados pesimistas — en la práctica suelen ser menores)
| Tramo | Estándar | Express (10+ lbs) |
|-------|----------|-------------------|
| SHEIN → Casillero EE.UU. | 15-20 días | 15-20 días (igual) |
| Casillero → Cuba | 7-15 días | 5-7 días |
| **Total** | **22-35 días** | **20-27 días** |

### Canales de pago
Todo pago es **personal/en persona**: **CUP efectivo** (al cambio del Toque), **USD** o **MLC**. No hay Zelle ni transferencias bancarias internacionales. No hay pasarela de pago en la plataforma.

### Terminología client-facing (IMPORTANTE)
La palabra **"casillero"** NO se muestra nunca al cliente. Internamente usamos un casillero (WeShipYou) como lógica de negocio, pero al cliente se le habla de **"EE.UU."** / "nuestro almacén en EE.UU." / "cuando tenemos tu pedido". Los nombres de estado internos (`EN_CASILLERO`, `EN_CAMINO_CASILLERO`) se quedan en la DB, pero sus **labels visibles** son "Recibido en EE.UU." y "En camino a EE.UU." (ver `ESTADO_LABEL` en `src/lib/types.ts`).

### Express (aclaración)
El envío express **solo acelera el tramo EE.UU. → Cuba** (una vez que el pedido está en nuestro poder en EE.UU.). NO acelera la compra/envío de SHEIN (ese tramo es igual: 15-20 días). Solo disponible para pedidos de 10+ lbs.

### Pricing express — PENDIENTE (decisión por la práctica)
El precio del express **no está cerrado**. Por ahora el landing muestra
**"$7/lb + servicio express (según peso)"** sin número fijo. El fundador hará
envíos reales antes del lanzamiento para definir la tarifa express con datos
propios. NO hardcodear un precio express hasta concluir.

### Costo base real (WeShipYou) — dato actualizado
Tarifa vigente de WeShipYou (Telegram, supera a la prensa vieja de ~$4/lb / 21 días):
- **10 lbs = $21.94 USD (~$2.19/lb), envío aéreo, 7-10 días hábiles, ciudades principales.**
- Escalonado: más peso = menor $/lb. Casillero gratis 30 días. Consolidación incluida.
- Aduana cubana (exposición del destinatario): 30% de impuesto, límite 500 puntos/envío, umbral libre $0. Pendiente decidir si se cobra aparte o se absorbe.
- Margen estándar a $7/lb ≈ $4.80/lb sobre el costo base actual.
- **Curva exacta de $/lb por tramo de peso: pendiente de sacar de la calculadora logueada de WeShipYou.**

### Flujo de pago (2 momentos distintos)
1. **Pago del producto:** Cliente paga el total de los artículos SHEIN + markup cuando acepta el precio, en persona (CUP/USD/MLC). El pedido queda en `PENDIENTE_PAGO` hasta que se confirme el pago. Solo después el admin compra en SHEIN.
2. **Aviso del peso (NO es pago):** Cuando el paquete llega al casillero (`EN_CASILLERO`), el admin lo pesa y envía foto del peso como evidencia. Esto es un **aviso por adelantado** — el cliente ya sabe cuánto pesó antes de recoger.
3. **Pago de libras:** Se cobra **al recoger el pedido** (estado `DISPONIBLE_ENTREGA` / entrega en Cuba), no cuando llega al casillero. Para ese momento el cliente ya conoce el peso (paso 2). Puede verificar el peso en persona al recoger.

### Evidencia que guarda el admin por pedido
- Captura/link del precio real en SHEIN (por item)
- Link real al artículo en SHEIN (para que el cliente pueda verlo después)
- Foto del peso del paquete al recibirlo
- Confirmación del pago del cliente (producto + libras)

### Config defaults
```
precio_por_lb:  7.00    (USD por libra, mínimo 1 lb)
markup_factor:  1.30    (multiplicador sobre precio SHEIN)
whatsapp_phone: (a definir antes del lanzamiento)
express_days_cuba: 5-7  (solo pedidos 10+ lbs)
standard_days_cuba: 7-15
shein_days: 15-20
```

---

## Page Inventory

### Portal Cliente (mobile-first, max-width: 480px)

| Ruta | Nombre | Auth | Descripción |
|------|--------|------|-------------|
| `/` | Landing Page | No | Landing completo de 9 secciones (ver "Landing Page Structure" abajo). |
| `/login` | Login | No | Logo centrado, tabs "Entrar / Crear cuenta", email + password, link "¿Olvidaste tu contraseña?". Sin sidebar. |
| `/registro` | Registro | No | Igual que login pero tab "Crear cuenta" activo. Campos: nombre, email, password. |
| `/pedidos/nuevo` | Nuevo Pedido | Sí | Formulario multi-item: URL SHEIN + talla + color + cantidad + notas por item. Botón "Agregar otro producto". |
| `/pedidos/[id]` | Tracking | No | **Público.** Header rojo con estado actual + barra de progreso. Timeline vertical de estados. Botón "Copiar link". |
| `/dashboard` | Mis Pedidos | Sí | Saludo + stats (pedidos activos, histórico, USD gastado) + lista de pedidos con badges de estado. Bottom tab bar. |
| `/perfil` | Perfil | Sí | Nombre, email, teléfono, dirección. Botón "Cerrar sesión". Bottom tab bar. |

### Portal Admin (desktop-first, max-width: 1200px)

| Ruta | Nombre | Auth | Descripción |
|------|--------|------|-------------|
| `/admin/kanban` | Kanban | Admin | Navbar top oscuro. Barra de stats. Kanban horizontal con scroll. Cards con botón "Procesar items" en EN_REVISION. |
| `/admin/config` | Configuración | Admin | Navbar top oscuro. Formulario para editar whatsapp_phone, precio_por_lb, markup_factor. Toggles de notificaciones. |

---

## Landing Page Structure (`/`)

Landing completo de 9 secciones. Wireframe en `landing-wireframe.html`. Navbar sticky con scroll-anchors. Mobile-first pero rico en desktop.

| # | Sección | ID | Contenido |
|---|---------|----|-----------|
| Nav | Navbar sticky | — | Logo + links (¿Cómo funciona?, Precios, Tiempos, Pagos, FAQ) + CTA "Hacer un pedido". Fondo oscuro con blur. Links ocultos en móvil. |
| 1 | Hero | `#hero` | Full-bleed oscuro (100svh). Pill "247 pedidos entregados". Headline serif gigante "Tu pedido de SHEIN llega a *Cuba*". Sub + 2 CTAs. 4 stats: $7/lb, 22-35 días, 98% entregados, 5-7 días express. |
| 2 | ¿Cómo funciona? | `#como-funciona` | Fondo arena. 5 pasos con conectores → en desktop. Pasos 4-5 con número en teal (accent). |
| 3 | ¿Por qué Traelo? | `#por-que` | Comparación 2 columnas: ❌ Revendedor de Facebook (rojo) vs ✓ Traelo (teal). 6 items cada una. |
| 4 | Categorías | `#categorias` | Fondo arena. 6 cards: Ropa, Calzado, Belleza, Accesorios, Hogar + card destacada "Pedido +10 lbs" con express. Peso estimado por categoría. |
| 5 | Precios | `#precios` | Fondo oscuro. 2 cards: Estándar ($7/lb) vs Express (10+ lbs, featured terracota). Nota sobre pago de libras al recibir. |
| 6 | Tiempos | `#tiempos` | Tabla 3 tramos × 2 modos (estándar/express). Total 22-35 días vs 20-27 express. Nota temporada alta. |
| 7 | ¿Cómo pago? | `#como-pago` | Fondo arena. 4 pasos verticales con timeline: reserva → pago producto → llega al casillero (pesaje) → pago libras + entrega. Notas con evidencia. |
| 8 | FAQ | `#faq` | 8 preguntas en `<details>` acordeón. Aduanas, peso, precio real, cancelación, express, daños. |
| 9 | CTA final | `#cta-final` | Fondo oscuro centrado. "¿Listo para hacer tu pedido?" + CTA + botón WhatsApp. |
| Footer | Footer | — | Logo + tagline + botón WhatsApp verde + links + copyright. Fondo oscuro. |

**Decisión:** Sin sección de testimonios en el MVP (no hay clientes aún). Agregar en Fase 2 cuando haya pedidos reales que mostrar.

---

## Navigation

### Portal Cliente — Bottom Tab Bar
```
┌─────────────────────────────┐
│         contenido           │
│                             │
└─────────────────────────────┘
┌─────────────────────────────┐
│   🏠 Inicio │ 📋 Pedidos │ 👤 Perfil   │  ← fixed bottom, 56px height
└─────────────────────────────┘
```
- Tabs: **Inicio** (`/`) · **Pedidos** (`/dashboard`) · **Perfil** (`/perfil`)
- Botón flotante **+** en Pedidos lleva a `/pedidos/nuevo`
- La landing page tiene navbar propio (no bottom bar) hasta que el usuario hace login
- En `/pedidos/[id]` (tracking público) no hay bottom bar — es una página standalone compartible

### Portal Admin — Top Navbar
```
┌─────────────────────────────────────────────┐
│ Kanban   Configuración          traelo admin. │  ← bg #1C1714, sticky top
└─────────────────────────────────────────────┘
```
- Links: Kanban (activo por defecto) · Configuración
- Logo "traelo admin." a la derecha en terracota
- Salir como link discreto

---

## Auth

- **Método:** Email + password (Supabase Auth)
- **Login page:** Logo centrado, tabs "Entrar / Crear cuenta", sin sidebar
- **Olvidé contraseña:** Link debajo del campo password → email de reset via Supabase
- **Admin auth:** Mismo login, pero middleware verifica `profiles.rol = 'admin'` antes de `/admin/*`
- **Persistencia:** Supabase maneja la sesión. Cookie httpOnly. Redirect a `/dashboard` tras login.
- **Sin login público:** El tracking `/pedidos/[id]` es público por UUID — no requiere cuenta

---

## Decisions Log

| Fecha | Decisión | Razonamiento |
|-------|----------|--------------|
| 2026-06-08 | Fraunces en lugar de Playfair Display | Más contemporáneo, menos europeo. Mejor fit para audiencia latinoamericana joven. |
| 2026-06-08 | Plus Jakarta Sans en lugar de Inter/DM Sans | Geométrico, limpio, diferenciador. Inter es demasiado común en 2025. |
| 2026-06-08 | Terracota `#C4522A` como primary | Color tierra caribeño. Confianza sin corporativismo. Distinto a los azules/grises genéricos de logistics apps. |
| 2026-06-08 | Teal `#00B5A0` reservado solo para estados confirmados | El color de confianza se gana. No se usa como decoración. |
| 2026-06-08 | Portal cliente mobile-first, admin desktop-first | Los clientes usan el teléfono. El admin (founder) usa la computadora para el Kanban. |
| 2026-06-08 | Sin Bebas Neue para números | Overused en 2024-2025. Plus Jakarta Sans tabular-nums es suficiente y más coherente. |
| 2026-06-08 | Tracking page como tarjeta compartible | Diseñada para ser screenshoteada y compartida en grupos de WhatsApp como prueba de confianza. |
| 2026-06-08 | Landing sin hero carousel ni feature grid | Una foto editorial, un headline, un CTA. El "¿Cómo funciona?" vive debajo del fold en 3 pasos. |
| 2026-06-08 | Bottom tab bar en portal cliente | Patrón más familiar en móvil (Instagram/WhatsApp). 3 tabs: Inicio, Pedidos, Perfil. |
| 2026-06-08 | Auth: email + password | Simple, conocido por todos. Magic link tiene demasiada fricción en primer uso para audiencia cubana. |
| 2026-06-08 | Tracking `/pedidos/[id]` sin navbar ni bottom bar | Es una página standalone pública compartible. Diseñada como tarjeta, no como app. |
| 2026-06-08 | Admin: top navbar oscuro | El admin (founder) usa desktop. Sidebar no vale la pena para solo 2 secciones. |
