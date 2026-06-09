import type { ReactNode } from "react";
import { AppHeader, type BackConfig } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first authenticated shell: top app bar (brand + notifications), a
 * centered max-w-md column, and the fixed bottom tab bar. Used by every
 * signed-in client page. NOT used by the public tracking page when viewed
 * logged-out, which renders standalone.
 *
 * Applied as a component (not a route-group layout) so /pedidos/[id] can stay
 * public while /pedidos and /pedidos/nuevo keep the nav.
 *
 * Pass `header={false}` to drop the app bar; pass `back` to add a back arrow.
 */
export function AppShell({
  children,
  className,
  header = true,
  back,
}: {
  children: ReactNode;
  className?: string;
  header?: boolean;
  back?: BackConfig;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto w-full max-w-md">
        {header && <AppHeader back={back} />}
        <main className={cn("px-5 pb-28", header ? "pt-2" : "pt-8", className)}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
