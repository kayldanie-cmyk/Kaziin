"use client";

import { useState } from "react";

export function SupportUsForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-line rounded-[16px] p-8 bg-accent-soft text-center">
        <h2 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-2">
          Message Received
        </h2>
        <p className="text-ink-soft text-[15px] max-w-[400px] mx-auto">
          Thank you for reaching out. Our team will contact you shortly to discuss how we can work together.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-[16px] p-8 bg-accent-soft text-left">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">First Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Last Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[14px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">Organization</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">How would you like to support?</label>
          <textarea
            required
            rows={4}
            placeholder="Let us know how you want to partner with us..."
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[14px] resize-none"
          />
        </div>
        <div className="pt-4 border-t border-line mt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] hover:bg-[#1E4D39] transition-colors"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
