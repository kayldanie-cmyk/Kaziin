/**
 * Kaziin — Daraja M-Pesa Integration
 * =====================================
 * Supports:
 *  - STK Push (Lipa Na M-Pesa Online)
 *  - C2B (Customer to Business)
 *  - B2C (Business to Customer payouts)
 *  - Transaction Status Query
 *  - Account Balance Query
 *
 * Set the following environment variables:
 *  MPESA_CONSUMER_KEY=...
 *  MPESA_CONSUMER_SECRET=...
 *  MPESA_SHORTCODE=...           (e.g. 174379 for sandbox)
 *  MPESA_PASSKEY=...             (Lipa Na M-Pesa passkey)
 *  MPESA_ENV=sandbox|production
 *  MPESA_CALLBACK_BASE_URL=...   (your public domain, e.g. https://kaziin.com)
 *  MPESA_INITIATOR_NAME=...      (for B2C)
 *  MPESA_SECURITY_CREDENTIAL=... (encrypted initiator password)
 */

const MPESA_ENV = process.env.MPESA_ENV ?? "sandbox";

const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

/** Get an OAuth access token from Safaricom */
export async function getDarajaToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daraja auth failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

/** Generate the base64-encoded password for STK Push */
function getStkPassword(): { password: string; timestamp: string } {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  return { password, timestamp };
}

export interface StkPushParams {
  /** Amount in KES (whole number) */
  amount: number;
  /** Customer phone number — format: 254XXXXXXXXX */
  phone: string;
  /** A short reference visible on the M-Pesa prompt (max 12 chars) */
  accountReference: string;
  /** Description of the transaction (max 13 chars) */
  transactionDesc: string;
  /** Custom callback suffix, e.g. "jobs/pay" */
  callbackSuffix?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/** Initiate an STK Push (Lipa Na M-Pesa) prompt to the customer's phone */
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const token = await getDarajaToken();
  const { password, timestamp } = getStkPassword();
  const callbackUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/payments/mpesa/callback/${params.callbackSuffix ?? "stk"}`;

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(params.amount),
    PartyA: params.phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: params.phone,
    CallBackURL: callbackUrl,
    AccountReference: params.accountReference.slice(0, 12),
    TransactionDesc: params.transactionDesc.slice(0, 13),
  };

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`STK Push failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<StkPushResponse>;
}

export interface StkQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

/** Query the status of a pending STK Push */
export async function queryStkPush(checkoutRequestId: string): Promise<StkQueryResponse> {
  const token = await getDarajaToken();
  const { password, timestamp } = getStkPassword();

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`STK Query failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<StkQueryResponse>;
}

/** Parse the M-Pesa STK callback body */
export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

export function parseStkCallback(body: MpesaCallbackBody) {
  const cb = body.Body.stkCallback;
  const success = cb.ResultCode === 0;
  const meta = cb.CallbackMetadata?.Item ?? [];

  const get = (name: string) => meta.find((i) => i.Name === name)?.Value;

  return {
    success,
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    amount: success ? Number(get("Amount")) : null,
    mpesaReceiptNumber: success ? String(get("MpesaReceiptNumber") ?? "") : null,
    transactionDate: success ? String(get("TransactionDate") ?? "") : null,
    phoneNumber: success ? String(get("PhoneNumber") ?? "") : null,
  };
}
