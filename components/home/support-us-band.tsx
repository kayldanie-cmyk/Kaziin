import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SupportUsBand() {
  return (
    <div className="bg-accent-soft py-6 md:py-10 border-t border-line">
      <div className="wrap flex flex-col items-center text-center gap-5">
        <h2
          className="font-display font-bold max-w-[600px] text-[#2F6D53]"
          style={{ fontSize: "clamp(26px, 3.4vw, 38px)" }}
        >
          We are dedicated to eradicating unemployment.
        </h2>
        <p className="text-[16px] text-ink max-w-[500px] leading-relaxed">
          Kaziin is on a mission to open up opportunities for everyone, regardless of where they start. Join our effort to make a lasting impact.
        </p>
        <div className="mt-4">
          <Link
            href="/support-us"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-bold text-[15px] rounded-xl hover:bg-accent/90 transition-colors shadow-xs"
          >
            Support us
          </Link>
        </div>
      </div>
    </div>
  );
}
