import type { MetadataRoute } from "next";

/**
 * PWA web app manifest. Next serves this at /manifest.webmanifest and injects
 * the <link rel="manifest"> automatically. Branding per DESIGN.md ("Verano
 * Confiable"): terracotta theme on a warm cream background.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Traelo — Tu pedido de SHEIN llega a Cuba",
    short_name: "Traelo",
    description:
      "Pide productos de SHEIN con envío a Cuba. Precio confirmado y tracking en tiempo real.",
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    // Cream of the cards/loader so the native launch splash blends with our web
    // loader (and the icon's own cream square stops being visible). Note: the
    // native splash bakes this in at APK build time → regenerate the APK in
    // PWABuilder for it to take effect on the installed app.
    background_color: "#f0ebe0",
    theme_color: "#c4522a",
    lang: "es",
    dir: "ltr",
    categories: ["shopping"],
    // Long-press shortcuts on the installed app icon.
    shortcuts: [
      {
        name: "Nuevo pedido",
        short_name: "Nuevo pedido",
        url: "/pedidos/nuevo",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mis pedidos",
        short_name: "Mis pedidos",
        url: "/pedidos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Rastrear pedido",
        short_name: "Rastreo",
        url: "/rastreo",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    // Only real, fetchable PNG files here. The app's SVG favicon is served by
    // Next's metadata route (src/app/icon.svg) and is NOT a static file at
    // /icon.svg, so referencing it here makes PWABuilder fail ("image doesn't
    // exist"). PNGs in /public are what Android/iOS and PWABuilder/Bubblewrap use.
    icons: [
      { src: "/icons/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      // Maskable: Android adapts it to circular/rounded launcher masks.
      {
        src: "/icons/icon-maskable-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
    // Shown in the Android install dialog (richer "app-like" prompt).
    screenshots: [
      {
        src: "/screenshots/screenshot-2.jpg",
        sizes: "486x1080",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Tu inicio: pedido activo, hacer un pedido y el cambio del día",
      },
      {
        src: "/screenshots/screenshot-1.jpg",
        sizes: "486x1080",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Seguimiento de tu pedido en tiempo real",
      },
    ],
  };
}
