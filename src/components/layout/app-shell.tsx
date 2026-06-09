import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first authenticated shell: top app bar (brand + notifications), a
 * centered max-w-md column, and the fixed bottom tab bar. Used by every
 * signed-in client page. NOT used by the public tracking page, which renders
 * standalone.
 *
 * Applied as a component (not a route-group layout) so /pedidos/[id] can stay
 * public while /pedidos and /pedidos/nuevo keep the nav.
 *
 * Pass `header={false}` to drop the app bar (e.g. forced flows).
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
        <main className={cn("px-5 pb-28", header ? "pt-2" : "pt-8", className)}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
