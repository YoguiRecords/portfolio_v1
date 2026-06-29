import type { ReactNode } from "react";
import { cn } from "./cn";

/** Chip techno (teinte or discrète), conforme à la DA. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] bg-accent/[0.07] px-2 py-0.5 text-xs font-medium text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
