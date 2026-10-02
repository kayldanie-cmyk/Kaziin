import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface AssessmentSuccessProps {
  careerGoal: string;
  name: string;
}

export function AssessmentSuccess({ careerGoal, name }: AssessmentSuccessProps) {
  // Determine next steps based on goal
  let steps: { title: string; desc: string; href: string; action: string }[] = [];

  switch (careerGoal) {
    case "find_first_job":
      steps = [
        { title: "Complete your profile", desc: "Add your skills and upload your CV.", href: "/profile", action: "Go to Profile" },
        { title: "Apply for Career Path Support", desc: "Get personalized guidance to land your first role.", href: "/career-support/apply/path", action: "Apply Now" },
        { title: "Browse Open Jobs", desc: "See what roles are currently available.", href: "/dashboard/jobs", action: "View Jobs" },
      ];
      break;
    case "change_career":
      steps = [
        { title: "Apply for Skills Support", desc: "Get help bridging your skills gap.", href: "/career-support/apply/skills", action: "Apply Now" },
        { title: "Explore Training", desc: "Find courses to help you transition.", href: "/career-support/training", action: "View Training" },
        { title: "Update Career Passport", desc: "Highlight transferable skills.", href: "/profile", action: "Update Profile" },
      ];
      break;
    case "advance_career":
      steps = [
        { title: "Browse Training & Certifications", desc: "Find programs to level up your career.", href: "/career-support/training", action: "View Training" },
        { title: "Apply for Funding", desc: "See if you qualify for training grants.", href: "/career-support/funding", action: "Find Funding" },
        { title: "Update Passport", desc: "Keep your achievements up to date.", href: "/profile", action: "Update Profile" },
      ];
      break;
    case "work_internationally":
      steps = [
        { title: "Apply for Global Career Support", desc: "Get help with visas and relocation.", href: "/auth/signup?role=global&next=/global-dashboard", action: "Apply Now" },
        { title: "Browse International Jobs", desc: "See opportunities abroad.", href: "/global-dashboard", action: "View Jobs" },
        { title: "Check Funding Options", desc: "Explore mobility grants.", href: "/career-support/funding", action: "Find Funding" },
      ];
      break;
    case "start_skilled_trade":
      steps = [
        { title: "Apply for Skills Support", desc: "Find apprenticeships and trade programs.", href: "/career-support/apply/skills", action: "Apply Now" },
        { title: "Apply for Funding", desc: "Get help paying for trade school.", href: "/career-support/funding", action: "Find Funding" },
        { title: "Browse Trade Jobs", desc: "See entry-level opportunities.", href: "/dashboard/jobs", action: "View Jobs" },
      ];
      break;
    case "work_remotely":
    case "become_self_employed":
      steps = [
        { title: "Browse Remote Jobs", desc: "Find flexible opportunities.", href: "/dashboard/jobs", action: "View Jobs" },
        { title: "Update Career Passport", desc: "Showcase your portfolio.", href: "/profile", action: "Update Profile" },
        { title: "Apply for Career Path Support", desc: "Get advice on freelancing/remote work.", href: "/career-support/apply/path", action: "Apply Now" },
      ];
      break;
    default:
      steps = [
        { title: "Explore Training", desc: "Find courses to develop new skills.", href: "/career-support/training", action: "View Training" },
        { title: "Apply for Skills Support", desc: "Get personalized guidance.", href: "/career-support/apply/skills", action: "Apply Now" },
        { title: "Apply for Funding", desc: "Explore financial support options.", href: "/career-support/funding", action: "Find Funding" },
      ];
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-[#2F6D53]/10 text-[#2F6D53] rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-display text-[28px] font-bold text-[#2F6D53] mb-2">
        Assessment Complete!
      </h2>
      <p className="text-ink-soft text-[15px] mb-8 max-w-[400px]">
        Thanks {name}, we've built a personalized roadmap based on your goal to <strong>{careerGoal.replace(/_/g, " ")}</strong>.
      </p>

      <div className="w-full text-left space-y-4 mb-8">
        <h3 className="font-semibold text-ink text-[16px] mb-2">Recommended Next Steps</h3>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-line rounded-[12px] bg-paper">
            <div>
              <h4 className="font-semibold text-[14.5px] text-[#2F6D53]">{step.title}</h4>
              <p className="text-[13.5px] text-ink-soft">{step.desc}</p>
            </div>
            <Link href={step.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {step.action}
            </Link>
          </div>
        ))}
      </div>

      <Link href="/career-support/plan" className={buttonVariants({ size: "lg", className: "w-full" })}>
        View Full Career Plan
      </Link>
    </div>
  );
}
