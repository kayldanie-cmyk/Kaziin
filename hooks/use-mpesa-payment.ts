"use client";

import { useState, useCallback } from "react";

export type PaymentStatus = "idle" | "pending" | "polling" | "completed" | "failed";

interface UseMpesaPaymentOptions {
  onSuccess?: (receipt: string, amount: number) => void;
  onError?: (message: string) => void;
}

interface InitiateParams {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackSuffix?: string;
}

export function useMpesaPayment({ onSuccess, onError }: UseMpesaPaymentOptions = {}) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiate = useCallback(async (params: InitiateParams) => {
    setStatus("pending");
    setError(null);
    setReceipt(null);

    try {
      const res = await fetch("/api/payments/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to initiate payment");
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setStatus("polling");

      // Poll for completion every 3 seconds, up to 60 seconds
      let attempts = 0;
      const maxAttempts = 20;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setStatus("failed");
          setError("Payment timed out. Please check your M-Pesa messages and try again.");
          onError?.("Payment timed out");
          return;
        }

        attempts++;

        try {
          const statusRes = await fetch(
            `/api/payments/mpesa/status?checkoutRequestId=${data.checkoutRequestId}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "completed") {
            setStatus("completed");
            setReceipt(statusData.receipt);
            onSuccess?.(statusData.receipt, statusData.amount);
            return;
          }

          if (statusData.status === "failed") {
            setStatus("failed");
            setError(statusData.resultDesc ?? "Payment was declined or cancelled.");
            onError?.(statusData.resultDesc ?? "Payment failed");
            return;
          }

          // Still pending — poll again
          setTimeout(poll, 3000);
        } catch {
          // Network hiccup — retry
          setTimeout(poll, 3000);
        }
      };

      setTimeout(poll, 5000); // First check after 5s (STK takes a moment)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setStatus("failed");
      setError(message);
      onError?.(message);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setStatus("idle");
    setCheckoutRequestId(null);
    setReceipt(null);
    setError(null);
  }, []);

  return { status, checkoutRequestId, receipt, error, initiate, reset };
}
