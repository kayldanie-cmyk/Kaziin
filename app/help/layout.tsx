import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about job search, career support, hiring, and platform features.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
