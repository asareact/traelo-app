import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-error/30 bg-error/5 text-error",
  success: "border-accent/30 bg-accent/5 text-accent",
  info: "border-info/30 bg-info/5 text-info",
};

/** Inline feedback banner for form errors / confirmations. */
export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
