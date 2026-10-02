"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── Match Ring (conic gradient score) ───────────────────── */

interface MatchRingProps {
  score: number;
  size?: "xs" | "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const ringSize = {
  xs: { outer: 28, inner: 20, text: "text-[8px]" },
  sm: { outer: 40, inner: 31, text: "text-[10px]" },
  md: { outer: 56, inner: 44, text: "text-[12px]" },
  lg: { outer: 72, inner: 58, text: "text-[15px]" },
};

export function MatchRing({
  score,
  size = "md",
  animate = true,
  className,
}: MatchRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!animate || animated.current) return;

    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || animated.current) return;
          animated.current = true;

          if (prefersReduced) {
            setDisplayScore(score);
            return;
          }

          const start = performance.now();
          const duration = 900;

          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(eased * score);
            setDisplayScore(val);
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [score, animate]);

  const { outer, inner, text } = ringSize[size];

  return (
    <div
      ref={ref}
      className={cn("rounded-full flex items-center justify-center shrink-0", className)}
      style={{
        width: outer,
        height: outer,
        background: `conic-gradient(var(--color-accent) ${displayScore}%, var(--color-line) ${displayScore}% 100%)`,
      }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${score}% match`}
    >
      <span
        className={cn(
          "rounded-full bg-paper flex items-center justify-center font-data font-semibold text-accent-dark",
          text
        )}
        style={{ width: inner, height: inner }}
      >
        {displayScore}%
      </span>
    </div>
  );
}

/* ── Linear Progress Bar ─────────────────────────────────── */

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  animate?: boolean;
  height?: number;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  animate = true,
  height = 8,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const [displayWidth, setDisplayWidth] = useState(animate ? 0 : percentage);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!animate || animated.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || animated.current) return;
          animated.current = true;
          requestAnimationFrame(() => setDisplayWidth(percentage));
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [percentage, animate]);

  return (
    <div
      ref={ref}
      className={cn("w-full bg-accent-soft rounded-full overflow-hidden", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full bg-accent rounded-full transition-[width] duration-700"
        style={{
          width: `${displayWidth}%`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
