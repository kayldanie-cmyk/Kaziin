import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { JobsClient } from "@/components/jobs/jobs-client";
import { getJobs } from "@/lib/data";

/* ============================================================
   Job Search Page — /jobs
   Server Component that fetches data and passes it to the client.
   ============================================================ */

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const q = params.q;
  const filter = params.filter;

  // Determine filters to pass to getJobs
  let workArrangement;
  let employmentType;

  if (filter && filter !== "All") {
    if (filter === "Remote") {
      workArrangement = "remote";
    } else {
      employmentType = filter.toLowerCase();
    }
  }

  const jobs = await getJobs({
    query: q,
    workArrangement,
    employmentType,
  });

  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <JobsClient initialJobs={jobs} />
      </main>
      <Footer />
    </>
  );
}
