/**
 * Clean stroke icons for Traelo. 24x24 viewBox, currentColor stroke.
 * Replaces emoji across the landing for a more premium, intentional look.
 */
type IconProps = { className?: string; size?: number };

function base(size = 24, className = "") {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export function IconLink({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  );
}

export function IconShield({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconWallet({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v0" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="16" cy="13" r="1.3" />
    </svg>
  );
}

export function IconTruck({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function IconScale({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 4v16" />
      <path d="M7 8h10" />
      <path d="M7 8l-3 6a3 3 0 0 0 6 0l-3-6z" />
      <path d="M17 8l-3 6a3 3 0 0 0 6 0l-3-6z" />
      <path d="M8 20h8" />
    </svg>
  );
}

export function IconShirt({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 4l3 2 3-2 5 3-2 3-2-1v9H8v-9l-2 1-2-3z" />
    </svg>
  );
}

export function IconShoe({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 8c1 0 2 .5 3 2l2 2 4 1 8 2c1 .3 1 1.5 1 2v1H3z" />
      <path d="M6 10l1.5-1.5" />
    </svg>
  );
}

export function IconSparkle({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
      <path d="M18 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  );
}

export function IconBag({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

export function IconHome({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

export function IconBox({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function IconWhatsapp({ className, size }: IconProps) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.13c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23s8.23 3.69 8.23 8.23-3.69 8.43-8.31 8.43zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}
