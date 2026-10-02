import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { MyTasksClient } from "./my-tasks-client";

export const metadata: Metadata = {
  title: "My Tasks | Quick Tasks",
  description: "Manage your posted tasks and tasks you are performing.",
};

export default function MyTasksPage() {
  return (
    <>
      <PublicNav />
      <MyTasksClient />
      <Footer />
    </>
  );
}
