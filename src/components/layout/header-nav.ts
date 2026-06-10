import { routes } from "@/config/site";

/**
 * Header behaviour per route. MAIN pages (the bottom-nav destinations) show the
 * hamburger menu and no page title (Home shows the greeting instead). Every
 * other (secondary) page shows a back button + its title.
 */
const MAIN_ROUTES = new Set<string>([
  routes.dashboard,
  routes.pedidos,
  routes.nuevoPedido,
  routes.rastreo,
  routes.perfil,
]);

export interface HeaderInfo {
  isMain: boolean;
  isHome: boolean;
  /** Page title shown on secondary pages (null on main pages). */
  title: string | null;
  /** Where the back button goes if there's no history to pop. */
  backFallback: string;
}

/** Titles for the main pages (Home uses the greeting instead, so it's null). */
const MAIN_TITLES: Record<string, string> = {
  [routes.pedidos]: "Pedidos",
  [routes.nuevoPedido]: "Nuevo pedido",
  [routes.rastreo]: "Rastreo",
  [routes.perfil]: "Perfil",
};

export function resolveHeader(pathname: string): HeaderInfo {
  const isHome = pathname === routes.dashboard;
  const isMain = MAIN_ROUTES.has(pathname);

  if (isMain) {
    return {
      isMain: true,
      isHome,
      title: isHome ? null : (MAIN_TITLES[pathname] ?? null),
      backFallback: routes.dashboard,
    };
  }

  // Secondary pages → title + back.
  let title: string | null = null;
  let backFallback: string = routes.dashboard;

  if (/^\/pedidos\/[^/]+\/productos$/.test(pathname)) {
    title = "Productos";
    backFallback = pathname.replace(/\/productos$/, "");
  } else if (/^\/pedidos\/[^/]+$/.test(pathname)) {
    title = "Detalle del pedido";
    backFallback = routes.rastreo;
  } else if (pathname === routes.completarPerfil) {
    title = "Completar perfil";
    backFallback = routes.perfil;
  } else if (pathname === routes.notificaciones) {
    title = "Notificaciones";
  } else if (pathname === routes.sobreNosotros) {
    title = "Sobre nosotros";
  } else if (pathname === routes.soporte) {
    title = "Soporte";
  } else {
    const seg = pathname.split("/").filter(Boolean).pop() ?? "";
    title = seg ? seg[0].toUpperCase() + seg.slice(1) : null;
  }

  return { isMain: false, isHome, title, backFallback };
}
