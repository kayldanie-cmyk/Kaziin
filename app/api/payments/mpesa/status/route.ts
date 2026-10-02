import { NextRequest, NextResponse } from "next/server";
import { queryStkPush } from "@/lib/daraja";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/payments/mpesa/status?checkoutRequestId=xxx
 *
 * Polls Safaricom for the status of a pending STK Push.
 * Returns { status: "pending" | "completed" | "failed", ... }
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutRequestId = request.nextUrl.searchParams.get("checkoutRequestId");
  if (!checkoutRequestId) {
    return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
  }

  // First check our own DB — callback may have already arrived
  const { data: record } = await supabase
    .from("payment_requests")
    .select("status, mpesa_receipt_number, amount, result_desc")
    .eq("checkout_request_id", checkoutRequestId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (record && record.status !== "pending") {
    return NextResponse.json({
      status: record.status,
      receipt: record.mpesa_receipt_number,
      amount: record.amount,
      resultDesc: record.result_desc,
    });
  }

  // Fall back to querying Safaricom directly
  try {
    const result = await queryStkPush(checkoutRequestId);
    const status =
      result.ResultCode === "0" ? "completed" : result.ResultCode === "" ? "pending" : "failed";

    return NextResponse.json({ status, resultDesc: result.ResultDesc });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
