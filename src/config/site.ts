/**
 * App-wide constants: routes + client navigation. Centralizing routes here
 * means a path rename is a one-line change, not a grep-and-pray.
 */

export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  pedidos: "/pedidos",
  nuevoPedido: "/pedidos/nuevo",
  pedido: (id: string) => `/pedidos/${id}`,
  rastreo: "/rastreo",
  notificaciones: "/notificaciones",
  perfil: "/perfil",
  completarPerfil: "/perfil/completar",
  admin: "/admin",
  sobreNosotros: "/sobre-nosotros",
  soporte: "/soporte",
} as const;

/** Bottom-nav tabs for the authenticated client area (mobile-first). */
export const clientNav = [
  { href: routes.dashboard, label: "Inicio", icon: "home" },
  { href: routes.pedidos, label: "Pedidos", icon: "box" },
  { href: routes.nuevoPedido, label: "Pedir", icon: "plus", primary: true },
  { href: routes.rastreo, label: "Rastreo", icon: "truck" },
  { href: routes.perfil, label: "Perfil", icon: "user" },
] as const;

export type ClientNavItem = (typeof clientNav)[number];
