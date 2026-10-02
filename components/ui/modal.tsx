"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

/* ============================================================
   Modal — Accessible dialog/modal
   Design System §46
   ============================================================ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      onClose();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        "backdrop:bg-ink/40 backdrop:backdrop-blur-sm",
        "bg-paper rounded-[16px] border border-line shadow-2xl p-0 m-auto",
        "max-h-[85vh] overflow-y-auto",
        size === "sm" && "w-full max-w-[420px]",
        size === "md" && "w-full max-w-[560px]",
        size === "lg" && "w-full max-w-[720px]",
        size === "xl" && "w-full max-w-[960px]",
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {title && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line">
          <h2 className="font-display font-semibold text-[18px]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-label hover:bg-paper hover:text-ink transition-colors"
            aria-label="Close"
          >
            
          </button>
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </dialog>
  );
}

/* ============================================================
   Drawer — Slide-out drawer (mobile-friendly)
   ============================================================ */

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          "absolute top-0 bottom-0 bg-paper border-line shadow-2xl flex flex-col w-full max-w-[400px]",
          "transition-transform duration-300",
          side === "right" && "right-0 border-l",
          side === "left" && "left-0 border-r",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
            <h2 className="font-display font-semibold text-[18px]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-label hover:bg-paper hover:text-ink transition-colors"
              aria-label="Close"
            >
              
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
