import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently. `clsx` handles conditionals/arrays,
 * `twMerge` dedupes conflicting utilities (e.g. `px-2 px-4` → `px-4`).
 * The single className helper for every UI primitive.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
