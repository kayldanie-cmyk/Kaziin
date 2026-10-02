"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  /** If provided, navigates to this href instead of router.back() */
  href?: string;
  label?: string;
  className?: string;
  /** Optional click handler — takes precedence over href and router.back() */
  onClick?: () => void;
}

/**
 * A consistent back navigation button.
 * - If `onClick` is provided, calls it directly (e.g. for in-page step navigation).
 * - If `href` is provided, renders a Link to that route.
 * - Otherwise uses router.back() for in-history navigation.
 */
export function BackButton({ href, label = "Back", className = "", onClick }: BackButtonProps) {
  const router = useRouter();

  const base =
    "inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft hover:text-ink transition-colors group";

  const arrow = (
    <svg
      className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${className}`}>
        {arrow}
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {arrow}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={`${base} ${className}`}>
      {arrow}
      {label}
    </button>
  );
}
