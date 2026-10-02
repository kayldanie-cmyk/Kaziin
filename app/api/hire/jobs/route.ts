import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RecruiterProfile = {
  role: string | null;
  employer_id: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const profileResult = await getRecruiterProfile(supabase);

    if ("response" in profileResult) return profileResult.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const { profile } = profileResult;

    let query = supabase
      .from("jobs")
      .select("*, employer:employers(*), applications(count)")
      .order("posted_at", { ascending: false });

    if (profile.role !== "admin") {
      if (!profile.employer_id) {
        return NextResponse.json({ jobs: [], count: 0 });
      }
      query = query.eq("employer_id", profile.employer_id);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data ?? [], count: data?.length ?? 0 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const profileResult = await getRecruiterProfile(supabase);

    if ("response" in profileResult) return profileResult.response;

    const body = (await request.json()) as Record<string, unknown>;
    const title = readString(body.title);
    const location = readString(body.location);
    const description = readString(body.description);
    const employerId =
      profileResult.profile.role === "admin"
        ? readString(body.employerId) || profileResult.profile.employer_id
        : profileResult.profile.employer_id;

    if (!title || !location || !description) {
      return NextResponse.json(
        { error: "title, location, and description are required." },
        { status: 400 }
      );
    }

    if (!employerId) {
      return NextResponse.json(
        { error: "Your recruiter profile needs an employer before you can post jobs." },
        { status: 403 }
      );
    }

    const slug = `${slugify(title)}-${Date.now()}`;
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        slug,
        title,
        employer_id: employerId,
        location,
        work_arrangement: readString(body.workArrangement) || "onsite",
        employment_type: readString(body.employmentType) || "full-time",
        salary_min: readNumber(body.salaryMin),
        salary_max: readNumber(body.salaryMax),
        salary_currency: readString(body.salaryCurrency) || null,
        salary_period: readString(body.salaryPeriod) || "annual",
        description,
        experience_level: readString(body.experienceLevel) || "Mid-level",
        requirements: readList(body.requirements),
        skills: readList(body.skills),
        benefits: readList(body.benefits),
        status: readString(body.status) || "published",
      })
      .select("*, employer:employers(*)")
      .single();

    if (error) {
      return NextResponse.json({ 
        error: `Supabase Insert Error: ${error.message} | Role: ${profileResult.profile.role} | EmployerID: ${employerId} | is_recruiter check: ${profileResult.profile.role === "recruiter"}`
      }, { status: 500 });
    }

    return NextResponse.json({ job: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

async function getRecruiterProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, employer_id")
    .eq("id", user.id)
    .maybeSingle<RecruiterProfile>();

  if (error) {
    return {
      response: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }

  if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
    return {
      response: NextResponse.json(
        { error: "Recruiter access required." },
        { status: 403 }
      ),
    };
  }

  return { profile };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") return [];

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
