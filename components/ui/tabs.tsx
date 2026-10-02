"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";

/* ============================================================
   Tabs — Tab navigation component
   Design System §46
   ============================================================ */

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  return (
    <div
      className={clsx(
        "flex gap-1 overflow-x-auto scrollbar-none",
        variant === "underline" && "border-b border-line gap-0",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "inline-flex items-center gap-2 text-[14px] font-medium transition-colors whitespace-nowrap shrink-0",
            variant === "underline" && [
              "px-4 py-3 border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-accent text-accent-dark"
                : "border-transparent text-muted-label hover:text-ink hover:border-line",
            ],
            variant === "pills" && [
              "px-3.5 py-2 rounded-[8px]",
              activeTab === tab.id
                ? "bg-accent text-white"
                : "text-muted-label hover:bg-paper hover:text-ink",
            ],
            variant === "default" && [
              "px-3.5 py-2 rounded-[8px]",
              activeTab === tab.id
                ? "bg-paper border border-line text-ink"
                : "text-muted-label hover:text-ink",
            ]
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={clsx(
                "font-data text-[11px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id
                  ? "bg-accent-soft text-accent-dark"
                  : "bg-paper text-muted-label"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   TabPanel — Content panel for a tab
   ============================================================ */

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (id !== activeTab) return null;
  return (
    <div role="tabpanel" aria-labelledby={id} className={className}>
      {children}
    </div>
  );
}
