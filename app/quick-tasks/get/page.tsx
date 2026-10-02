import { redirect } from "next/navigation";

/* Redirect GET A TASK to the main quick-tasks feed (§7) */
export default function GetTaskPage() {
  redirect("/quick-tasks#feed");
}
