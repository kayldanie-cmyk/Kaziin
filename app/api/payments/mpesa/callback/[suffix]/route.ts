import { NextRequest, NextResponse } from "next/server";
import { parseStkCallback, type MpesaCallbackBody } from "@/lib/daraja";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/payments/mpesa/callback/[suffix]
 *
 * Safaricom will POST the STK result to this endpoint after the user
 * accepts or rejects the prompt.
 *
 * This route updates the payment_requests table and triggers any
 * downstream fulfillment logic (unlock feature, activate subscription, etc).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ suffix: string }> }
) {
  const { suffix } = await params;

  let body: MpesaCallbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid payload" }, { status: 400 });
  }

  const parsed = parseStkCallback(body);
  const supabase = await createClient();

  // Update the payment_requests record
  const { data: paymentRow } = await supabase
    .from("payment_requests")
    .update({
      status: parsed.success ? "completed" : "failed",
      mpesa_receipt_number: parsed.mpesaReceiptNumber,
      result_code: parsed.resultCode,
      result_desc: parsed.resultDesc,
      transaction_date: parsed.transactionDate,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_request_id", parsed.checkoutRequestId)
    .select()
    .maybeSingle();

  if (parsed.success && paymentRow) {
    // ─── Fulfillment Logic (plug in per context) ──────────────────────
    // The `suffix` parameter tells us what was being paid for.
    // Add cases here as you monetize different features.
    switch (suffix) {
      case "job-post":
        await supabase.from("job_post_payments").insert({
          payment_request_id: paymentRow.id,
          user_id: paymentRow.user_id,
          amount: parsed.amount,
          receipt: parsed.mpesaReceiptNumber,
        });
        break;

      case "subscription":
        await supabase.from("subscriptions").upsert({
          user_id: paymentRow.user_id,
          plan: paymentRow.account_reference,
          status: "active",
          activated_at: new Date().toISOString(),
          receipt: parsed.mpesaReceiptNumber,
        });
        break;

      case "career-support":
        await supabase.from("career_support_payments").insert({
          payment_request_id: paymentRow.id,
          user_id: paymentRow.user_id,
          amount: parsed.amount,
          receipt: parsed.mpesaReceiptNumber,
        });
        break;

      // Add more cases as you decide where to monetize
      default:
        console.log(`[Daraja Callback] Unknown suffix: ${suffix}`, parsed);
    }
  }

  // Always respond 200 to Safaricom, even on errors
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
