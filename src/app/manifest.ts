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
    background_color: "#fafaf7",
    theme_color: "#c4522a",
    lang: "es",
    icons: [
      // SVG first for crisp scaling where supported.
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      // PNGs are what Android/iOS and PWABuilder/Bubblewrap actually consume.
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
  };
}
