/**
 * Per-navigation transition. Unlike layout.tsx, a template re-mounts on every
 * route change, so the `.page-enter` animation (fade + slight rise, defined in
 * globals.css) plays on each navigation. Reduced-motion users get it instantly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
