import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────── */

type ButtonVariant = "primary" | "ghost" | "danger" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/* ── Styles ──────────────────────────────────────────────── */

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[7px] border border-transparent cursor-pointer transition-all duration-[150ms] ease-out focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2F6D53] text-white hover:bg-[#2F6D53]/90 active:bg-[#2F6D53]/90",
  ghost:
    "bg-transparent text-ink border-line hover:border-ink active:border-ink",
  danger:
    "bg-danger text-paper-alt hover:bg-danger/90",
  link:
    "bg-transparent text-[#2F6D53] hover:underline p-0 border-none",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3 py-1.5",
  md: "text-[14.5px] px-[18px] py-[10px]",
  lg: "text-[15px] px-6 py-3",
};

function buttonVariants({ variant = "primary", size = "md", loading = false, className }: { variant?: ButtonVariant, size?: ButtonSize, loading?: boolean, className?: string } = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], loading && "opacity-70", className);
}

/* ── Component ───────────────────────────────────────────── */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonVariants({ variant, size, loading, className })}
        {...props}
      >
        {loading && (
          <span>...</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
export type { ButtonProps, ButtonVariant, ButtonSize };
