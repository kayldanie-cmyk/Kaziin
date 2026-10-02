import { NextRequest, NextResponse } from "next/server";
import { initiateStkPush } from "@/lib/daraja";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/payments/mpesa/stk
 *
 * Request body:
 * {
 *   phone: "254XXXXXXXXX",
 *   amount: 500,
 *   accountReference: "JOB_POST",
 *   transactionDesc: "Job Post Fee",
 *   callbackSuffix: "stk"   // optional
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    phone: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
    callbackSuffix?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phone, amount, accountReference, transactionDesc, callbackSuffix } = body;

  if (!phone || !amount || !accountReference || !transactionDesc) {
    return NextResponse.json({ error: "Missing required fields: phone, amount, accountReference, transactionDesc" }, { status: 400 });
  }

  // Normalize phone number to 254XXXXXXXXX format
  const normalizedPhone = phone
    .replace(/\s+/g, "")
    .replace(/^\+/, "")
    .replace(/^07/, "2547")
    .replace(/^01/, "2541");

  if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
    return NextResponse.json({ error: "Invalid phone number. Use format: 07XXXXXXXX or 254XXXXXXXXX" }, { status: 400 });
  }

  try {
    const result = await initiateStkPush({
      phone: normalizedPhone,
      amount,
      accountReference,
      transactionDesc,
      callbackSuffix,
    });

    // Log the payment initiation to Supabase
    await supabase.from("payment_requests").insert({
      user_id: user.id,
      merchant_request_id: result.MerchantRequestID,
      checkout_request_id: result.CheckoutRequestID,
      phone: normalizedPhone,
      amount,
      account_reference: accountReference,
      transaction_desc: transactionDesc,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      customerMessage: result.CustomerMessage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
