/**
 * Per-navigation transition. Unlike layout.tsx, a template re-mounts on every
 * route change, so the `.page-enter` fade (globals.css) plays on each navigation
 * — and, because it re-mounts the subtree, so does the content `.rise` on
 * <main> inside <AppShell>. The wrapper stays a pure fade (no transform) so it
 * never becomes a containing block for the fixed bottom nav. Reduced-motion
 * users get everything instantly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
