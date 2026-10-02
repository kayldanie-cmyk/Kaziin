"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

/* ============================================================
   NotificationBell — Dropdown notification indicator.
   Polls /api/notifications for unread count and recent items.
   ============================================================ */

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  application_update: "",
  match_found: "",
  interview_scheduled: "",
  message_received: "",
  verification_update: "",
  funding_update: "",
  system: "",
};

export function NotificationBell({ direction = "down" }: { direction?: "up" | "down" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications?: Notification[];
        unreadCount?: number;
      };
      setNotifications((data.notifications ?? []).slice(0, 10));
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead(id: string) {
    // Optimistic update first
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  }

  async function markAllAsRead() {
    // Optimistic update first
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-paper transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div 
          className={`absolute ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } right-0 w-[380px] max-h-[480px] bg-paper border border-line rounded-[14px] shadow-lg overflow-hidden z-50`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <span className="font-display font-semibold text-[15px]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[12px] text-accent-dark hover:underline font-data"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-[14px] text-ink-soft">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const icon = TYPE_ICONS[notification.type] ?? TYPE_ICONS.system;
                const content = (
                  <div
                    className={`px-4 py-3 border-b border-line flex gap-3 transition-colors hover:bg-paper cursor-pointer ${
                      !notification.read ? "bg-accent-soft/20" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      setOpen(false);
                    }}
                  >
                    <span className="text-[18px] mt-0.5 shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[13.5px] leading-tight ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-accent-dark shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notification.message && (
                        <p className="text-[12.5px] text-ink-soft mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <span className="text-[11px] text-ink-soft font-data mt-1 block">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                );

                if (notification.action_url) {
                  return (
                    <Link key={notification.id} href={notification.action_url}>
                      {content}
                    </Link>
                  );
                }

                return <div key={notification.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
