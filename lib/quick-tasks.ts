/* ============================================================
   KAZIIN — Quick Tasks Engine
   Shared types, constants, state machine, dispatch simulation,
   and localStorage helpers.
   Per SKILL.md §9, §12, §15
   ============================================================ */

// ── Types ──────────────────────────────────────────────────

export type TaskStatus =
  | "DRAFT"
  | "REQUESTED"
  | "SEARCHING"
  | "TASKER_MATCHED"
  | "TASKER_ACCEPTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CUSTOMER_CONFIRMED"
  | "PAYMENT_RELEASED"
  | "RATED"
  | "CLOSED"
  // Exception statuses
  | "CANCELLED"
  | "DECLINED"
  | "EXPIRED"
  | "FAILED"
  | "DISPUTED"
  | "REFUNDED";

export type PricingType = "fixed" | "open";
export type UrgencyType = "asap" | "schedule";

export interface QuickTask {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  locationDetails?: string;
  destination?: string;
  budget: string;
  currency: string;
  urgency: UrgencyType;
  scheduledDate?: string;
  scheduledTime?: string;
  pricingType: PricingType;
  customerName: string;
  customerPhone: string;
  postedAt: string;
  status: TaskStatus;
  // Assignment
  taskerId?: string;
  taskerName?: string;
  taskerRating?: number;
  taskerCompletedTasks?: number;
  taskerVerified?: boolean;
  matchedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  // Rating
  customerRating?: number;
  taskerRating2?: number;
  ratingNote?: string;
}

// ── Categories ─────────────────────────────────────────────

export const TASK_CATEGORIES = [
  { id: "delivery", label: "Delivery", icon: "📦", description: "Send or pick up packages, documents, food" },
  { id: "cleaning", label: "Cleaning", icon: "🧹", description: "Home, office, or commercial cleaning" },
  { id: "moving", label: "Moving", icon: "🚚", description: "Help with moving, lifting, or transporting" },
  { id: "shopping", label: "Shopping", icon: "🛍️", description: "Pick up groceries, supplies, or items" },
  { id: "repairs", label: "Repairs", icon: "🔧", description: "Plumbing, electrical, handyman work" },
  { id: "computer_help", label: "Computer Help", icon: "💻", description: "Setup, troubleshooting, software help" },
  { id: "event_support", label: "Event Support", icon: "🎉", description: "Setup, catering, photography, support" },
  { id: "personal_assistance", label: "Personal Assistance", icon: "📝", description: "Errands, admin tasks, scheduling" },
  { id: "other", label: "Other", icon: "✨", description: "Anything else — describe what you need" },
] as const;

export function getCategoryInfo(categoryId: string) {
  return TASK_CATEGORIES.find((c) => c.id === categoryId) ?? { id: categoryId, label: categoryId, icon: "✨", description: "" };
}

// ── State Machine ──────────────────────────────────────────
// Valid transitions per SKILL.md §12

const STATE_TRANSITIONS: Partial<Record<TaskStatus, TaskStatus[]>> = {
  DRAFT: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["SEARCHING", "CANCELLED"],
  SEARCHING: ["TASKER_MATCHED", "CANCELLED", "EXPIRED"],
  TASKER_MATCHED: ["TASKER_ACCEPTED", "DECLINED", "CANCELLED"],
  TASKER_ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "FAILED", "CANCELLED"],
  COMPLETED: ["CUSTOMER_CONFIRMED", "DISPUTED"],
  CUSTOMER_CONFIRMED: ["PAYMENT_RELEASED"],
  PAYMENT_RELEASED: ["RATED", "CLOSED"],
  RATED: ["CLOSED"],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: TaskStatus): TaskStatus[] {
  return STATE_TRANSITIONS[current] ?? [];
}

// The primary "happy path" next step for tasker flow
export function getNextTaskerStatus(current: TaskStatus): TaskStatus | null {
  const sequence: TaskStatus[] = [
    "TASKER_ACCEPTED",
    "EN_ROUTE",
    "ARRIVED",
    "IN_PROGRESS",
    "COMPLETED",
  ];
  const idx = sequence.indexOf(current);
  if (idx >= 0 && idx < sequence.length - 1) return sequence[idx + 1];
  return null;
}

// ── Status Display ─────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  REQUESTED: "Requested",
  SEARCHING: "Finding a tasker…",
  TASKER_MATCHED: "Tasker found",
  TASKER_ACCEPTED: "Tasker accepted",
  EN_ROUTE: "On the way",
  ARRIVED: "Arrived",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CUSTOMER_CONFIRMED: "Confirmed",
  PAYMENT_RELEASED: "Payment released",
  RATED: "Rated",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  FAILED: "Failed",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type StatusColor = "green" | "yellow" | "red" | "gray" | "blue";

export function getStatusColor(status: string): StatusColor {
  const positive = ["TASKER_ACCEPTED", "COMPLETED", "CUSTOMER_CONFIRMED", "PAYMENT_RELEASED", "RATED", "CLOSED"];
  const warning = ["SEARCHING", "TASKER_MATCHED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "REQUESTED"];
  const negative = ["CANCELLED", "DECLINED", "FAILED", "DISPUTED", "REFUNDED"];
  if (positive.includes(status)) return "green";
  if (warning.includes(status)) return "yellow";
  if (negative.includes(status)) return "red";
  if (status === "EXPIRED") return "gray";
  return "gray";
}

export function getStatusBadgeClasses(status: string): string {
  const color = getStatusColor(status);
  const map: Record<StatusColor, string> = {
    green: "bg-accent-soft text-accent-dark",
    yellow: "bg-gold-soft text-gold",
    red: "bg-danger-soft text-danger",
    gray: "bg-muted-label-soft text-muted-label",
    blue: "bg-[#E8EEFF] text-[#4B6BFB]",
  };
  return map[color];
}

// ── Demo Taskers (for dispatch simulation) ──────────────────

export const DEMO_TASKERS = [
  { id: "tasker_1", name: "John M.", rating: 4.8, completedTasks: 42, verified: true, categories: ["delivery", "moving", "shopping"], serviceArea: "Nairobi" },
  { id: "tasker_2", name: "Grace W.", rating: 4.9, completedTasks: 87, verified: true, categories: ["cleaning", "personal_assistance"], serviceArea: "Nairobi" },
  { id: "tasker_3", name: "Peter K.", rating: 4.7, completedTasks: 31, verified: true, categories: ["repairs", "computer_help"], serviceArea: "Nairobi" },
  { id: "tasker_4", name: "Alice N.", rating: 4.6, completedTasks: 19, verified: false, categories: ["event_support", "personal_assistance", "shopping"], serviceArea: "Nairobi" },
  { id: "tasker_5", name: "David O.", rating: 4.5, completedTasks: 56, verified: true, categories: ["delivery", "moving", "repairs"], serviceArea: "Nairobi" },
];

export function findMatchingTasker(task: QuickTask) {
  // Deterministic dispatch per SKILL.md §9
  const eligible = DEMO_TASKERS.filter((t) => t.categories.includes(task.category));
  if (eligible.length === 0) return DEMO_TASKERS[0]; // fallback
  // Sort by: verified first, then rating, then completed tasks
  return eligible.sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.completedTasks - a.completedTasks;
  })[0];
}

// ── Demo Tasks ─────────────────────────────────────────────

export const DEMO_TASKS: QuickTask[] = [
  {
    id: "qt_demo_1",
    category: "delivery",
    title: "Deliver documents from Kilimani to Karen",
    description: "A4 envelope, handle with care. Address will be shared on WhatsApp.",
    location: "Kilimani",
    destination: "Karen, Nairobi",
    budget: "400",
    currency: "KES",
    urgency: "asap",
    pricingType: "fixed",
    customerName: "Sarah",
    customerPhone: "+254711000001",
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_2",
    category: "cleaning",
    title: "House cleaning — 3-bedroom apartment",
    description: "Deep clean needed. Cleaning supplies provided.",
    location: "Westlands, Nairobi",
    budget: "1500",
    currency: "KES",
    urgency: "schedule",
    scheduledDate: "2026-10-01",
    scheduledTime: "09:00",
    pricingType: "fixed",
    customerName: "James",
    customerPhone: "+254711000002",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_3",
    category: "repairs",
    title: "Plumber needed — kitchen sink leak",
    description: "Pipe under the sink is dripping. Should be a quick fix.",
    location: "South B, Nairobi",
    budget: "800",
    currency: "KES",
    urgency: "asap",
    pricingType: "fixed",
    customerName: "Mike",
    customerPhone: "+254711000003",
    postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_4",
    category: "shopping",
    title: "Pick up groceries from Carrefour",
    description: "Shopping list of ~15 items. Budget includes delivery fee.",
    location: "Two Rivers, Nairobi",
    destination: "Lavington",
    budget: "600",
    currency: "KES",
    urgency: "asap",
    pricingType: "fixed",
    customerName: "Linda",
    customerPhone: "+254711000004",
    postedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_5",
    category: "computer_help",
    title: "Set up new laptop and transfer files",
    description: "Need to migrate data from an old Windows laptop to a new MacBook.",
    location: "Kilimani, Nairobi",
    budget: "1000",
    currency: "KES",
    urgency: "schedule",
    scheduledDate: "2026-10-02",
    scheduledTime: "14:00",
    pricingType: "fixed",
    customerName: "Brian",
    customerPhone: "+254711000005",
    postedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: "REQUESTED",
  },
];

// ── localStorage Helpers ───────────────────────────────────

const STORAGE_KEYS = {
  POSTED_TASKS: "kaziin_quick_tasks",
  ACCEPTED_IDS: "kaziin_accepted_quick_tasks",
  ACTIVE_TASKS: "kaziin_active_quick_tasks",
} as const;

export function getAllTasks(): QuickTask[] {
  if (typeof window === "undefined") return DEMO_TASKS;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTED_TASKS) || "[]") as QuickTask[];
  return [...DEMO_TASKS, ...stored];
}

export function getAvailableTasks(): QuickTask[] {
  return getAllTasks().filter((t) => t.status === "REQUESTED");
}

export function getPostedTasks(): QuickTask[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTED_TASKS) || "[]") as QuickTask[];
}

export function getActiveTasks(): QuickTask[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_TASKS) || "[]") as QuickTask[];
}

export function getAcceptedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCEPTED_IDS) || "[]") as string[]);
}

export function savePostedTask(task: QuickTask): void {
  const existing = getPostedTasks();
  localStorage.setItem(STORAGE_KEYS.POSTED_TASKS, JSON.stringify([task, ...existing]));
}

export function acceptTask(task: QuickTask): QuickTask {
  // Add to accepted IDs
  const acceptedIds = Array.from(getAcceptedIds());
  if (!acceptedIds.includes(task.id)) {
    acceptedIds.push(task.id);
    localStorage.setItem(STORAGE_KEYS.ACCEPTED_IDS, JSON.stringify(acceptedIds));
  }

  // Add to active tasks with assignment info
  const active = getActiveTasks();
  const tasker = findMatchingTasker(task);
  const updatedTask: QuickTask = {
    ...task,
    status: "TASKER_ACCEPTED",
    taskerId: tasker.id,
    taskerName: tasker.name,
    taskerRating: tasker.rating,
    taskerCompletedTasks: tasker.completedTasks,
    taskerVerified: tasker.verified,
    acceptedAt: new Date().toISOString(),
  };

  const existingIndex = active.findIndex((t) => t.id === task.id);
  if (existingIndex >= 0) {
    active[existingIndex] = updatedTask;
  } else {
    active.push(updatedTask);
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TASKS, JSON.stringify(active));

  return updatedTask;
}

export function updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
  const active = getActiveTasks();
  const updated = active.map((t) =>
    t.id === taskId ? { ...t, status: newStatus, ...(newStatus === "COMPLETED" ? { completedAt: new Date().toISOString() } : {}) } : t
  );
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TASKS, JSON.stringify(updated));
}

export function findTaskById(taskId: string): QuickTask | null {
  // Check active tasks first (most up-to-date status)
  const active = getActiveTasks();
  const activeTask = active.find((t) => t.id === taskId);
  if (activeTask) return activeTask;

  // Then all tasks (demo + posted)
  return getAllTasks().find((t) => t.id === taskId) ?? null;
}

// ── Time Helpers ───────────────────────────────────────────

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
