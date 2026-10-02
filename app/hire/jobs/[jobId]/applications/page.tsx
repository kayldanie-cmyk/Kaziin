import { createClient } from "@/lib/supabase/server";
import { getJobApplications } from "@/lib/ats-data";
import { notFound } from "next/navigation";
import { ATSKanbanClient } from "./ats-kanban-client";
import Link from "next/link";


export default async function JobATSPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, employer_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const applications = await getJobApplications(jobId);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link
          href={`/hire/jobs`}
          className="text-ink-soft hover:text-ink transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-paper"
        >
          
        </Link>
        <div>
          <h1 className="font-display font-bold text-[24px]">ATS Pipeline</h1>
          <p className="text-ink-soft text-[14.5px] font-data">
            Managing candidates for {job.title}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ATSKanbanClient initialApplications={applications} jobId={jobId} />
      </div>
    </div>
  );
}
