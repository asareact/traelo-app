import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "w-full rounded-md border-[1.5px] border-border bg-bg px-3.5 py-3 text-[15px] text-text outline-none transition placeholder:text-muted focus:border-primary disabled:opacity-50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(base, "min-h-20 resize-y", className)} {...props} />
  );
}
