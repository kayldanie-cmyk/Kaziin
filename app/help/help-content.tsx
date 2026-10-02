"use client";

import { useMemo, useState } from "react";

const FAQ_SECTIONS = [
  {
    title: "Getting started",
    items: [
      {
        q: "How do I create an account?",
        a: 'Click "Get started" from any page and choose your path: find work, explore career support, or hire talent. One account can access candidate and career support tools.',
      },
      {
        q: "Is Kaziin free for job seekers?",
        a: "Job search, applications, Career Passport profiles, and basic matching are free for candidates.",
      },
      {
        q: "What is a Career Passport?",
        a: "Your Career Passport is a professional profile for your skills, experience, education, work preferences, and verification status where checks are available.",
      },
    ],
  },
  {
    title: "Finding work",
    items: [
      {
        q: "How does job matching work?",
        a: "Kaziin compares your Career Passport with each role's skills, experience, location, and work preferences, then shows the match factors the product can currently explain.",
      },
      {
        q: "Can I search for specific roles?",
        a: "Yes. You can search by keyword and use visible filters such as remote, hybrid, full-time, contract, and freelance.",
      },
      {
        q: "How do I apply for a job?",
        a: 'On a job detail page, click "Apply now". If you are signed out, Kaziin will ask you to sign in first and then return you to the role.',
      },
    ],
  },
  {
    title: "Career support",
    items: [
      {
        q: "What is career support?",
        a: "Career Support helps candidates plan their career, find verified training, and explore international employment opportunities.",
      },
      {
        q: "How does career funding work?",
        a: "Kaziin connects eligible candidates to funding programs including grants, scholarships, and sponsored training. Our team will review your application and work with you to access the right support.",
      },
      {
        q: "How is the employer verified?",
        a: "Verified employers should pass checks for business identity, hiring authority, and job authenticity before verified status is shown.",
      },
    ],
  },
  {
    title: "For recruiters",
    items: [
      {
        q: "How do I post a job?",
        a: 'Approved recruiter accounts can post jobs from the employer dashboard with role, location, requirements, salary, and status details.',
      },
      {
        q: "How does shortlisting work?",
        a: "Kaziin is designed to rank candidates against role requirements and explain the match, while recruiters retain full control of hiring decisions.",
      },
      {
        q: "What verification do candidates have?",
        a: "Candidate profiles can display verification status only after the relevant check has been completed.",
      },
    ],
  },
  {
    title: "Trust & safety",
    items: [
      {
        q: "How do I report a suspicious job listing?",
        a: "Use the Trust & Safety page for reporting guidance. Dedicated in-product report actions should be available on job and profile pages as the moderation flow matures.",
      },
      {
        q: "How is my data protected?",
        a: "Kaziin should only share profile and application information according to your account permissions and the action you take.",
      },
      {
        q: "What if I encounter a scam?",
        a: "Stop communication, avoid sending money or sensitive documents, and report the issue through Trust & Safety so the team can investigate.",
      },
    ],
  },
];

export function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !query ||
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
      ),
    })).filter((section) => section.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      <section className="pb-10">
        <div className="wrap">
          <div className="max-w-[520px] mx-auto flex items-center gap-2.5 pb-2 border-b border-line px-2">
            
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-none outline-none bg-transparent font-body text-[15px] w-full text-ink placeholder:text-[#9A9A94]"
              aria-label="Search help topics"
            />
          </div>
        </div>
      </section>

      <section className="pb-24 max-md:pb-16">
        <div className="wrap max-w-[760px] mx-auto">
          {filteredSections.map((section) => (
            <div key={section.title} className="mb-12 last:mb-0">
              <h2 className="font-display font-semibold text-[20px] mb-4">
                {section.title}
              </h2>
              <div className="flex flex-col divide-y divide-line">
                {section.items.map((item) => {
                  const key = `${section.title}-${item.q}`;
                  const id = key.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
                  const panelId = `faq-panel-${id}`;
                  const buttonId = `faq-button-${id}`;
                  const isOpen = openItem === key;

                  return (
                    <div key={key}>
                      <button
                        id={buttonId}
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full text-left px-5 py-4 hover:bg-paper/50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <span className="font-medium text-[15px]">
                            {item.q}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`text-ink-soft text-[14px] shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            v
                          </span>
                        </div>
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                        className="px-5 pb-4"
                      >
                        <p className="text-[14.5px] text-ink-soft leading-relaxed pr-8">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-soft text-[16px] mb-4">
                No results found for &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-accent-dark text-[14px] font-medium hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
