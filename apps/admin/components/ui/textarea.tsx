import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const BASE =
  "w-full min-h-24 rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Zone de texte multi-lignes stylée (focus ring or). Forward les props natives. */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(BASE, className)} {...props} />;
}
