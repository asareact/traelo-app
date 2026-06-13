/**
 * Brand loader built from the Traelo mark (box + arrow). Pure CSS animation,
 * zero deps — replaces the intro video as a full-screen splash. Fills its parent
 * (caller positions it: `fixed inset-0` in the real splash, a phone frame in the
 * preview). Background is `bg-surface` so it matches the cards / palette.
 *
 * Three variants:
 *  - "pulse" — the whole mark breathes. Sober, premium.
 *  - "draw"  — the teal arrow draws itself, then the box settles in. Elegant reveal.
 *  - "drop"  — the arrow keeps dropping into the box. Playful; tells the brand story.
 *
 * Respects prefers-reduced-motion (renders the static logo, no animation).
 */

const ARROW =
  "M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9";

export type LoaderVariant = "pulse" | "draw" | "drop";

function LoaderMark({ variant }: { variant: LoaderVariant }) {
  return (
    <svg
      className={`ll-mark ll-${variant}`}
      width={108}
      height={108}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <g className="ll-box">
        <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#A8431F" />
        <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#C4522A" />
        <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#D5673D" />
        <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#C4522A" />
      </g>
      {/* Filled arrow: static in pulse/drop; fades in after the stroke in draw. */}
      <path className="ll-arrow-fill" d={ARROW} fill="#00B5A0" />
      {/* Stroked arrow that draws itself — only shown in the "draw" variant. */}
      <path
        className="ll-arrow-draw"
        d={ARROW}
        fill="none"
        stroke="#00B5A0"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}

export function LogoLoader({ variant = "pulse" }: { variant?: LoaderVariant }) {
  return (
    <div className="ll-root flex h-full w-full flex-col items-center justify-center gap-7 bg-surface">
      <LoaderMark variant={variant} />
      <div className="flex flex-col items-center gap-3.5">
        <span className="font-display text-2xl font-bold tracking-tight text-text">
          traelo<span className="text-primary">.</span>
        </span>
        <span className="ll-dots flex gap-1.5" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <style>{LOADER_CSS}</style>
    </div>
  );
}

const LOADER_CSS = `
/* Sized to roughly match the native launch splash icon so the hand-off doesn't
   jump. Responsive (scales with the screen like the splash icon does). */
.ll-mark { width: min(48vw, 230px); height: min(48vw, 230px); transform-origin: center; }
.ll-arrow-draw { display: none; }

/* Pulse — the whole mark breathes */
.ll-pulse { animation: ll-pulse 1.6s ease-in-out infinite; }
@keyframes ll-pulse {
  0%, 100% { transform: scale(.9); opacity: .7; }
  50%      { transform: scale(1); opacity: 1; }
}

/* Draw-on — teal arrow draws, then the box settles in */
.ll-draw .ll-arrow-draw { display: block; stroke-dasharray: 1; animation: ll-draw 2.6s ease-in-out infinite; }
.ll-draw .ll-arrow-fill { opacity: 0; animation: ll-fill 2.6s ease-in-out infinite; }
.ll-draw .ll-box { transform-box: fill-box; transform-origin: center; animation: ll-boxin 2.6s ease-in-out infinite; }
@keyframes ll-draw {
  0%   { stroke-dashoffset: 1; }
  35%  { stroke-dashoffset: 0; }
  88%  { stroke-dashoffset: 0; opacity: 1; }
  96%, 100% { stroke-dashoffset: 0; opacity: 0; }
}
@keyframes ll-fill {
  0%, 33%  { opacity: 0; }
  50%, 88% { opacity: 1; }
  96%, 100% { opacity: 0; }
}
@keyframes ll-boxin {
  0%, 30%  { opacity: 0; transform: scale(.8); }
  52%, 88% { opacity: 1; transform: scale(1); }
  96%, 100% { opacity: 0; transform: scale(1); }
}

/* Drop — the arrow keeps dropping into the box (brand metaphor) */
.ll-drop .ll-arrow-fill { animation: ll-drop 1.8s cubic-bezier(.45,0,.25,1) infinite; }
.ll-drop .ll-box { transform-box: fill-box; transform-origin: center bottom; animation: ll-squash 1.8s ease-in-out infinite; }
@keyframes ll-drop {
  0%   { transform: translateY(-9px); opacity: 0; }
  25%  { opacity: 1; }
  40%  { transform: translateY(0); }
  52%  { transform: translateY(-2px); }
  64%  { transform: translateY(0); }
  88%  { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(0); opacity: 0; }
}
@keyframes ll-squash {
  0%, 36% { transform: scaleY(1); }
  44%     { transform: scaleY(.94); }
  56%     { transform: scaleY(1); }
}

/* Loading dots */
.ll-dots i { width: 6px; height: 6px; border-radius: 9999px; display: inline-block; background: #C4522A; animation: ll-bounce 1.1s ease-in-out infinite; }
.ll-dots i:nth-child(2) { animation-delay: .15s; background: #00B5A0; }
.ll-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes ll-bounce {
  0%, 100% { transform: translateY(0); opacity: .4; }
  50%      { transform: translateY(-5px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ll-mark, .ll-mark *, .ll-dots i { animation: none !important; }
  .ll-draw .ll-arrow-draw { display: none; }
  .ll-draw .ll-arrow-fill, .ll-draw .ll-box { opacity: 1 !important; transform: none !important; }
}
`;
