/** Kaziin logo mark — the "K" in a rounded green square. */
export function LogoMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#2F6D53" />
      <path
        d="M11 7 L11 25 M11 16 L21 7 M11 16 L21 25"
        stroke="#F7F4EC"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Full Kaziin logo: mark + wordmark. */
export function Logo({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-accent ${className || ""}`}>
      <LogoMark size={26} />
      <svg
        width="65"
        height="20"
        viewBox="0 0 90 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* K */}
        <path d="M4 2L4 22M4 12L12 4M4 12L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* A */}
        <path d="M22 22L28 2L34 22M25 15L31 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Z */}
        <path d="M42 22L54 22M42 2L54 2M54 2L42 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* I */}
        <path d="M62 2L62 22M62 2L62 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* I */}
        <path d="M72 2L72 22M72 2L72 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* N */}
        <path d="M82 22L82 2L90 22M90 2L90 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
