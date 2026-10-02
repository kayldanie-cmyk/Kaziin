import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Global Opportunities",
};

export default function GlobalMessagesPage() {
  return (
    <div className="max-w-[800px]">
      <h1 className="font-display font-bold text-[26px] text-accent">Messages</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Communicate with Kaziin Admin.
      </p>

      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-paper border border-line rounded-full flex items-center justify-center mb-4">
          
        </div>
        <h3 className="font-display font-bold text-[18px]">No messages yet</h3>
      </div>
    </div>
  );
}
