import { redirect } from "next/navigation";

// Demo page is deprecated — redirect to recruiters page
export default function DemoPage() {
  redirect("/recruiters");
}
