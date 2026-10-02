import clsx from "clsx";

/* ============================================================
   Avatar — User avatar with fallback initials
   Design System §46
   ============================================================ */

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
  xl: "w-16 h-16 text-[18px]",
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColor(name?: string | null): string {
  if (!name) return "bg-muted-label-soft";
  const colors = [
    "bg-accent-soft text-accent-dark",
    "bg-gold-soft text-gold",
    "bg-[#EAF0FF] text-[#4B6BFB]",
    "bg-danger-soft text-danger",
    "bg-[#E8F5E9] text-[#2E7D32]",
    "bg-[#FFF3E0] text-[#E65100]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "User avatar"}
        className={clsx(
          "rounded-full object-cover shrink-0",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <span
      className={clsx(
        "rounded-full flex items-center justify-center font-display font-semibold shrink-0",
        sizes[size],
        getColor(name),
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
