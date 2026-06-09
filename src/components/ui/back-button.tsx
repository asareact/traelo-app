"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@/components/brand/icons";

const cls =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition active:scale-90";

/**
 * Back affordance. Pass `href` to navigate to a fixed destination (used when
 * "back" should NOT return to the previous page — e.g. right after creating an
 * order we send the user to their list, not the empty form). Without `href` it
 * uses browser history, falling back to `fallbackHref` when there is none
 * (e.g. a tracking link opened cold in a new tab).
 */
export function BackButton({
  href,
  fallbackHref = "/",
}: {
  href?: string;
  fallbackHref?: string;
}) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} aria-label="Volver" className={cls}>
        <IconArrowLeft size={18} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label="Volver"
      className={cls}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
    >
      <IconArrowLeft size={18} />
    </button>
  );
}
