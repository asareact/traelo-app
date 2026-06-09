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
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#c4522a",
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
