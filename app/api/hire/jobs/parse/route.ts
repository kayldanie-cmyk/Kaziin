import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/hire/jobs/parse
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description } = await request.json();

  if (!description) {
    return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
  }

  // Simulate AI parsing of the job description
  const text = description.toLowerCase();
  const extractedSkills = [];
  
  if (text.includes("react")) extractedSkills.push("React");
  if (text.includes("node")) extractedSkills.push("Node.js");
  if (text.includes("python")) extractedSkills.push("Python");
  if (text.includes("excel")) extractedSkills.push("Microsoft Excel");
  if (text.includes("customer service")) extractedSkills.push("Customer Service");

  const title = text.split('\n')[0].substring(0, 50).trim() || "Untitled Job";

  return NextResponse.json({
    parsed: {
      title,
      suggestedSkills: extractedSkills.length > 0 ? extractedSkills : ["Communication", "Problem Solving"],
      experienceLevel: text.includes("senior") ? "senior" : text.includes("junior") ? "junior" : "mid-level",
      employmentType: text.includes("part-time") ? "part-time" : "full-time",
      workMode: text.includes("remote") ? "remote" : "on-site",
    }
  });
}
