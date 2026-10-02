import { cn } from "@/lib/utils";

/* ── Card ────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  padding?: "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
}

const paddingStyles = {
  sm: "p-sp-3",
  md: "p-sp-4",
  lg: "p-sp-5",
};

export function Card({
  children,
  className,
  featured = false,
  padding = "md",
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={cn(
        "border border-line/60 rounded-[14px] bg-transparent",
        paddingStyles[padding],
        featured &&
          "border-accent bg-accent-soft/20",
        className
      )}
    >
      {children}
    </Component>
  );
}

/* ── Card Header / Body helper ───────────────────────────── */

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pb-sp-3 border-b border-line", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("pt-sp-3", className)}>{children}</div>;
}
