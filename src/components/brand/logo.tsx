/**
 * Traelo logo — open box (terracotta) with an arrow dropping in (teal).
 * Inline SVG so it scales crisply and works on light or dark backgrounds.
 *
 * <Logo />                → icon + wordmark, dark text (light backgrounds)
 * <Logo variant="light" /> → icon + wordmark, cream text (dark backgrounds)
 * <Logo showText={false} /> → icon only
 */
export function Logo({
  variant = "dark",
  showText = true,
  className = "",
  size = 32,
}: {
  /** "dark"/"light" = fixed wordmark color; "auto" = follows the theme token. */
  variant?: "dark" | "light" | "auto";
  showText?: boolean;
  className?: string;
  size?: number;
}) {
  const wordColor =
    variant === "light"
      ? "#F0EBE0"
      : variant === "dark"
        ? "#1C1714"
        : undefined;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={`font-display font-bold tracking-tight ${
            variant === "auto" ? "text-text" : ""
          }`}
          style={{ color: wordColor, fontSize: size * 0.7 }}
        >
          traelo<span style={{ color: "#C4522A" }}>.</span>
        </span>
      )}
    </span>
  );
}

/** Just the box+arrow mark — useful as a favicon, avatar, or tight spaces. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Box left face (darker) */}
      <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#A8431F" />
      {/* Box right face */}
      <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#C4522A" />
      {/* Open flaps */}
      <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#D5673D" />
      <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#C4522A" />
      {/* Teal arrow dropping into the box */}
      <path
        d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9"
        fill="#00B5A0"
        stroke="#00B5A0"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
