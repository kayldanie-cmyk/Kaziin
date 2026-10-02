"use client";

import { useState } from "react";
import { useMpesaPayment } from "@/hooks/use-mpesa-payment";

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackSuffix?: string;
  onSuccess?: (receipt: string, amount: number) => void;
}

export function MpesaPaymentModal({
  isOpen,
  onClose,
  amount,
  accountReference,
  transactionDesc,
  callbackSuffix = "stk",
  onSuccess,
}: MpesaPaymentModalProps) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const { status, receipt, error, initiate, reset } = useMpesaPayment({
    onSuccess: (r, a) => {
      onSuccess?.(r, a);
    },
  });

  function validatePhone(value: string) {
    const normalized = value
      .replace(/\s+/g, "")
      .replace(/^\+/, "")
      .replace(/^07/, "2547")
      .replace(/^01/, "2541");
    if (!/^254[17]\d{8}$/.test(normalized)) {
      return "Please enter a valid Safaricom or Airtel number (07XXXXXXXX)";
    }
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    setPhoneError("");

    await initiate({
      phone,
      amount,
      accountReference,
      transactionDesc,
      callbackSuffix,
    });
  }

  function handleClose() {
    reset();
    setPhone("");
    setPhoneError("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-paper rounded-[20px] w-full max-w-[420px] p-6 sm:p-8 shadow-xl border border-line">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* M-Pesa logo mark */}
            <div className="w-10 h-10 rounded-full bg-[#00A859] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[12px] leading-none">M</span>
            </div>
            <div>
              <div className="font-display font-bold text-[16px] text-ink">Pay with M-Pesa</div>
              <div className="font-data text-[12px] text-ink-soft">Lipa Na M-Pesa</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-ink-soft"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Amount */}
        <div className="bg-accent/5 border border-accent/20 rounded-[12px] p-4 mb-6 text-center">
          <div className="font-data text-[12px] text-ink-soft mb-1">Amount to pay</div>
          <div className="font-display font-bold text-[32px] text-accent">
            KES {amount.toLocaleString()}
          </div>
          <div className="font-data text-[12px] text-ink-soft mt-1">{transactionDesc}</div>
        </div>

        {/* States */}
        {status === "idle" || status === "failed" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-danger">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="mpesa-phone" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                M-Pesa phone number
              </label>
              <input
                id="mpesa-phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                placeholder="07XXXXXXXX"
                className="w-full border border-line rounded-[10px] px-3.5 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors placeholder:text-ink-soft/50"
                required
              />
              {phoneError && (
                <p className="mt-1.5 text-[12px] text-danger">{phoneError}</p>
              )}
              <p className="mt-1.5 text-[12px] text-ink-soft">
                You&apos;ll receive an STK Push prompt on this number
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-[12px] bg-[#00A859] text-white font-bold text-[15px] hover:bg-[#008a4a] transition-colors"
            >
              Pay KES {amount.toLocaleString()}
            </button>
          </form>
        ) : status === "pending" ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-[15px] text-ink mb-1">Sending STK Push…</p>
            <p className="text-[13.5px] text-ink-soft">Check your phone for the M-Pesa prompt</p>
          </div>
        ) : status === "polling" ? (
          <div className="text-center py-6">
            <div className="text-[40px] mb-4">📱</div>
            <p className="font-semibold text-[15px] text-ink mb-1">Waiting for payment…</p>
            <p className="text-[13.5px] text-ink-soft mb-4">
              Enter your M-Pesa PIN on your phone to complete the payment.
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : status === "completed" ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4 text-[32px]">
              ✅
            </div>
            <p className="font-display font-bold text-[20px] text-[#2F6D53] mb-1">Payment Successful!</p>
            <p className="text-[13.5px] text-ink-soft mb-2">
              KES {amount.toLocaleString()} paid via M-Pesa
            </p>
            {receipt && (
              <p className="font-data text-[12px] text-ink-soft">
                Receipt: <span className="font-bold text-ink">{receipt}</span>
              </p>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 px-8 py-3 rounded-[10px] bg-accent text-white font-bold text-[14px] hover:bg-accent/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : null}

        {/* Secured by */}
        <p className="mt-4 text-center font-data text-[11px] text-ink-soft/60">
          🔒 Secured by Safaricom Daraja API
        </p>
      </div>
    </div>
  );
}
