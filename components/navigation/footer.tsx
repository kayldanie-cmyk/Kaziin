import Link from "next/link";

/* ============================================================
   Footer — Dark, serious, and professional.
   ============================================================ */

const FOOTER_COLS = [
  {
    title: "Candidates",
    links: [
      { label: "Find work", href: "/auth/signup?role=work" },
      { label: "Career Support", href: "/career-support" },
      { label: "Career profile", href: "/dashboard/profile" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Post a job", href: "/auth/signup?role=hire" },
      { label: "Search candidates", href: "/auth/signup?role=hire" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Trust & safety", href: "/trust" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#2F6D53] text-[#E3ECE6] py-12 sm:py-16 pb-10">
      <div className="wrap">
        
        {/* Top: Branding + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 mb-10 md:mb-16">
          
          <div>
            <Link href="/" aria-label="Kaziin home" className="inline-block mb-6 text-white hover:opacity-80 transition-opacity">
              
            </Link>
            <div className="font-display font-semibold text-[19px] tracking-wide text-white">
              FIND WORK. GO GLOBAL. HIRE TALENT.
            </div>
            <p className="mt-3 text-[14px] text-white/80 max-w-[280px] leading-relaxed">
              A smarter way to connect people with opportunity — locally, remotely, and across borders.
            </p>
          </div>

          <div className="grid grid-cols-2 md:flex md:justify-between gap-10">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] font-data font-semibold mb-5 text-white uppercase tracking-wider">
                  {col.title}
                </h4>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-[14px] mb-3 text-white/90 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex justify-between items-center flex-wrap gap-4 text-[13px] text-white/70">
          <span> {new Date().getFullYear()} Kaziin. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
