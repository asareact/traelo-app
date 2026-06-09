"use client";

import { useState } from "react";
import { IconLink, IconCheck } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";

/** Copies the current page URL (the shareable tracking link) to the clipboard. */
export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted transition active:scale-95",
        className,
      )}
    >
      {copied ? <IconCheck size={14} /> : <IconLink size={14} />}
      {copied ? "Link copiado" : "Copiar link"}
    </button>
  );
}
