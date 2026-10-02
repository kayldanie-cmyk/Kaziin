import type { Metadata } from "next";
import CareerAssessmentPage from "./page";

export const metadata: Metadata = {
  title: "Career Assessment | Kaziin",
  description:
    "Take the Kaziin career assessment to build your personal career plan. Understand where you are, where you want to go, and what steps to take next.",
};

export default function CareerAssessmentRoute() {
  return <CareerAssessmentPage />;
}
