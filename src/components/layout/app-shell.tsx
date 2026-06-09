import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first authenticated shell: a centered max-w-md column with the fixed
 * bottom tab bar. Used by every signed-in client page (dashboard, pedidos,
 * perfil). NOT used by the public tracking page, which renders standalone.
 *
 * Applied as a component (not a route-group layout) so /pedidos/[id] can stay
 * public while /pedidos and /pedidos/nuevo keep the nav.
 */
export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <main className={cn("mx-auto w-full max-w-md px-5 pb-28 pt-8", className)}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
