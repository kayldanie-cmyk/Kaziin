/* ============================================================
   Trust Section — "Verification you can click into."
   Clean, static verification cards without hover shifts or white accents.
   ============================================================ */

const TRUST_ITEMS = [
  {
    title: "Verified Employer",
    desc: "Business registration and hiring authority are confirmed before any job can be posted.",
    icon: (null),
    borderColor: "border-ink",
    iconBg: "bg-ink/5 text-ink"
  },
  {
    title: "Verified Opportunity",
    desc: "Role requirements, compensation, and working conditions are confirmed directly with the employer.",
    icon: (null),
    borderColor: "border-accent",
    iconBg: "bg-accent-soft text-accent-dark"
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="py-24 max-md:py-16 bg-paper">
      <div className="wrap">
        <div className="text-center max-w-[640px] mx-auto mb-16">
          <h2
            className="font-display font-bold text-accent"
            style={{ fontSize: "clamp(26px, 3.4vw, 38px)" }}
          >
            Verification you can trust.
          </h2>
          <p className="mt-4 text-[16px] text-ink-soft">
            Every badge on Kaziin means something specific — and tells you exactly what was checked.
          </p>
        </div>

        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-w-[800px] mx-auto">
          {TRUST_ITEMS.map((item) => (
            <div 
              key={item.title} 
              className={`bg-paper rounded-[14px] p-8 border-t-4 ${item.borderColor}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${item.iconBg}`}>
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-[18px] mb-2.5 text-accent">
                {item.title}
              </h3>
              <p className="text-[14px] text-ink-soft leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
