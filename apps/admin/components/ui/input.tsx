import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

const BASE =
  "w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Champ texte stylé (focus ring or). Forward les props natives. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(BASE, className)} {...props} />;
}
