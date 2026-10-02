import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { TaskDetailClient } from "./task-detail-client";

export const metadata: Metadata = {
  title: "Task Details | Quick Tasks",
  description: "View Quick Task details and manage status.",
};

export default function TaskDetailPage() {
  return (
    <>
      <PublicNav />
      <TaskDetailClient />
      <Footer />
    </>
  );
}
