import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn";

const BASE =
  "w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Liste déroulante stylée (focus ring or). Forward les props natives. */
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(BASE, className)} {...props}>
      {children}
    </select>
  );
}
