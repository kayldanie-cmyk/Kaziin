import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { QuickTasksLanding } from "./quick-tasks-landing";

export const metadata: Metadata = {
  title: "Quick Tasks",
  description:
    "Get things done fast. Post a task or find immediate work on Kaziin Quick Tasks.",
};

export default function QuickTasksPage() {
  return (
    <>
      <PublicNav />
      <QuickTasksLanding />
      <Footer />
    </>
  );
}
