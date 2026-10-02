import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  GLOBAL_DESTINATIONS,
  GLOBAL_PROFESSIONS,
  GLOBAL_SUPPORT_NEEDS,
} from "@/lib/global-interest";

const destinationValues: Set<string> = new Set(GLOBAL_DESTINATIONS.map((option) => option.value));
const professionValues: Set<string> = new Set(GLOBAL_PROFESSIONS.map((option) => option.value));
const supportNeedValues: Set<string> = new Set(GLOBAL_SUPPORT_NEEDS.map((option) => option.value));

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readSupportNeeds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.filter((item): item is string => typeof item === "string"))]
    .filter((item) => supportNeedValues.has(item))
    .slice(0, GLOBAL_SUPPORT_NEEDS.length);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("global_interest_requests")
      .select("id, destination_region, profession, support_needs, status, created_at, updated_at")
      .eq("candidate_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Unable to load your eligibility request." }, { status: 500 });
    }

    return NextResponse.json({ request: data });
  } catch {
    return NextResponse.json({ error: "Unable to load your eligibility request." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const destination = readString(body.destination);
    const selectedProfession = readString(body.profession);
    const otherProfession = readString(body.otherProfession);
    const profession = selectedProfession === "other" ? otherProfession : selectedProfession;
    const supportNeeds = readSupportNeeds(body.supportNeeds);
    const consentToReview = body.consentToReview === true;

    if (!destinationValues.has(destination)) {
      return NextResponse.json({ error: "Choose a target destination region." }, { status: 400 });
    }

    if (!profession || (selectedProfession !== "other" && !professionValues.has(selectedProfession))) {
      return NextResponse.json({ error: "Choose your current profession or industry." }, { status: 400 });
    }

    if (profession.length > 120) {
      return NextResponse.json({ error: "Profession must be 120 characters or fewer." }, { status: 400 });
    }

    if (!consentToReview) {
      return NextResponse.json({ error: "Confirm that Kaziin may review this request." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("global_interest_requests")
      .select("id, status")
      .eq("candidate_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "Unable to save your eligibility request." }, { status: 500 });
    }

    if (existing && existing.status !== "received") {
      return NextResponse.json(
        { error: "This request is already under review and can no longer be edited." },
        { status: 409 }
      );
    }

    const payload = {
      candidate_id: user.id,
      destination_region: destination,
      profession,
      support_needs: supportNeeds,
      status: "received",
      updated_at: new Date().toISOString(),
    };

    const query = existing
      ? supabase.from("global_interest_requests").update(payload).eq("id", existing.id)
      : supabase.from("global_interest_requests").insert(payload);
    const { data, error } = await query
      .select("id, destination_region, profession, support_needs, status, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to save your eligibility request." }, { status: 500 });
    }

    return NextResponse.json({ request: data }, { status: existing ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
