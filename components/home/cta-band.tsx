import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/* ============================================================
   CTA Band — "Build your Career Passport once. Use it everywhere."
   Routes through auth with pre-selected role.
   ============================================================ */

export function CtaBand() {
  return (
    <div className="bg-accent-soft">
      <div className="wrap flex items-center justify-between gap-sp-4 flex-wrap py-sp-6">
        <div>
          <h2
            className="font-display font-bold max-w-[480px] text-[#2F6D53]"
            style={{ fontSize: "clamp(24px, 3vw, 32px)" }}
          >
            Build your Career Passport once.
            <br />
            Use it everywhere.
          </h2>
          <p className="text-[15px] text-ink-soft mt-2 max-w-[400px]">
            One verified profile. Three portals. Unlimited opportunities.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/auth/signup?role=global" className={buttonVariants({ variant: "ghost" })}>
            Get career support
          </Link>
          <Link href="/auth/signup?role=work" className={buttonVariants()}>
            Find work
          </Link>
        </div>
      </div>
    </div>
  );
}
