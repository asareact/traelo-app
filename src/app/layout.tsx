import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { SiteIntro } from "@/components/motion/site-intro";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traelo — Tu pedido de SHEIN llega a Cuba",
  description:
    "Pide productos de SHEIN con envío a Cuba. Precio confirmado, tracking en tiempo real, sin transferencias a ciegas.",
  appleWebApp: { title: "Traelo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#070706" },
  ],
};

// Runs before paint: applies the saved theme (or system preference) so there's
// no light/dark flash on load, and flags a first-time visit so the brand intro
// overlay is up at first paint (no landing flash) without a video download for
// returning / reduced-motion users.
const bootScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');var seen=sessionStorage.getItem('traelo_intro_seen');var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(location.pathname==='/'&&!seen&&!reduce)document.documentElement.classList.add('intro-playing');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Rendered here (not inside a page) so its `position: fixed` is relative
            to the viewport — the page-transition template applies a transform,
            which would otherwise become its containing block. */}
        <SiteIntro />
        {children}
      </body>
    </html>
  );
}
