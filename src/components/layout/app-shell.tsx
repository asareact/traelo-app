import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first authenticated shell: top app bar (menu/back + brand + controls),
 * a centered max-w-md column, and the fixed bottom tab bar. Used by every
 * signed-in client page. The header decides menu-vs-back and the title from the
 * current route (see header-nav.ts), so callers pass nothing extra.
 *
 * Applied as a component (not a route-group layout) so /pedidos/[id] can stay
 * public while /pedidos and /pedidos/nuevo keep the nav. `header={false}` drops
 * the app bar.
 */
export function AppShell({
  children,
  className,
  header = true,
}: {
  children: ReactNode;
  className?: string;
  header?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto w-full max-w-md">
        {header && <AppHeader />}
        {/* `content-enter` carries the page-transition "rise". It lives here, on
            the content only — never on an ancestor of <BottomNav> — so the fixed
            nav stays anchored to the viewport. See globals.css. */}
        <main
          className={cn(
            "content-enter px-5 pb-28",
            // Extra top room so the floating header logo never overlaps the
            // first content (it straddles down into this space at scroll top).
            header ? "pt-10" : "pt-8",
            className,
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
