import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/applications/submit
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { jobId, coverLetter, answers } = body;

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .match({ job_id: jobId, candidate_id: user.id })
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already applied for this job." }, { status: 409 });
  }

  // Create application
  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      status: "submitted",
      draft: false,
      submitted_profile: { cover_letter: coverLetter || null },
    })
    .select()
    .single();

  if (appError || !application) {
    console.error("Error creating application:", appError);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }

  // Save answers if any
  if (answers && answers.length > 0) {
    const answerRows = answers
      .filter((a: any) => a.answer !== null && a.answer !== undefined && a.answer !== "")
      .map((a: any) => ({
        application_id: application.id,
        question_id: a.questionId,
        answer: typeof a.answer === "object" ? a.answer : { value: a.answer },
      }));

    if (answerRows.length > 0) {
      const { error: answerError } = await supabase
        .from("application_answers")
        .insert(answerRows);

      if (answerError) {
        console.error("Error saving answers:", answerError);
        // Don't fail the whole application for answer errors
      }
    }
  }

  // Create a notification for the candidate
  await supabase.from("notifications").insert({
    recipient_id: user.id,
    type: "application_submitted",
    title: "Application submitted",
    message: `Your application has been submitted. We'll notify you when the employer responds.`,
    read: false,
    action_url: "/dashboard/applications",
  });

  return NextResponse.json({
    success: true,
    applicationId: application.id,
  }, { status: 201 });
}