import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";

/* ============================================================
   Global 404 Not Found Page
   ============================================================ */

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-5 text-center">
      <Link href="/" className="mb-12" aria-label="Kaziin home">
        <Logo size={24} />
      </Link>

      <p className="font-data text-[13px] text-ink-soft mb-3">404</p>
      <h1 className="font-display font-bold text-[32px] mb-3">
        Page not found
      </h1>
      <p className="text-[16px] text-ink-soft max-w-[400px] mb-8">
        This page doesn&apos;t exist or has moved. Let&apos;s get you back on
        track.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/" className={buttonVariants()}>
          Go home
        </Link>
        <Link href="/jobs" className={buttonVariants({ variant: "ghost" })}>
          Find work
        </Link>
      </div>
    </div>
  );
}
