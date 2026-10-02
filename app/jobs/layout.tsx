import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Work",
  description: "Search open opportunities locally, remotely, and across borders.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
