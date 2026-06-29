import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

const VARIANTS = {
  primary: "bg-accent text-bg hover:bg-accent-strong",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2",
  subtle: "bg-surface-2 text-ink hover:bg-elevated",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Bouton générique (variants primary/ghost/subtle/danger). Forward les props natives. */
export function Button({ variant = "subtle", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
