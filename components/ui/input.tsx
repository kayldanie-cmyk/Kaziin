"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

/* ============================================================
   Input — Text input with label, error, and icon support
   Design System §46
   ============================================================ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13.5px] font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-label">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-[10px] border bg-paper px-3.5 py-2.5 text-[14.5px] text-ink transition-colors",
              "placeholder:text-muted-label",
              "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-danger" : "border-line",
              icon && "pl-10",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-[12.5px] text-danger" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[12.5px] text-muted-label">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
