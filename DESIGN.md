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
- **Dark mode:** Invertir surface/background. Reducir saturación de primary/accent en 10-15%. Mantener la calidez (no cambiar a grises fríos).
  ```css
  [data-theme="dark"] {
    --bg:      #1C1714;
    --surface: #2A2218;
    --text:    #F0EBE0;
    --muted:   #8C7F76;
    --border:  #3A2E26;
  }
  ```

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
