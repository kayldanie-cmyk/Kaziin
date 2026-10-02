export const GLOBAL_DESTINATIONS = [
  { value: "europe", label: "Europe" },
  { value: "north_america", label: "North America" },
  { value: "middle_east", label: "Middle East" },
  { value: "asia", label: "Asia" },
  { value: "oceania", label: "Oceania" },
  { value: "other", label: "Other or open to options" },
] as const;

export const GLOBAL_PROFESSIONS = [
  { value: "nursing", label: "Healthcare and nursing" },
  { value: "software", label: "Software and IT" },
  { value: "engineering", label: "Engineering" },
  { value: "education", label: "Education and teaching" },
  { value: "hospitality", label: "Hospitality and tourism" },
  { value: "other", label: "Other" },
] as const;

export const GLOBAL_SUPPORT_NEEDS = [
  { value: "travel", label: "Travel" },
  { value: "visa", label: "Visa fees" },
  { value: "relocation", label: "Relocation" },
  { value: "training", label: "Training or certification" },
  { value: "licensing", label: "Equipment or licensing" },
] as const;

export const GLOBAL_INTEREST_STATUSES = {
  received: {
    label: "Application received",
    description: "Your application has been received and our team will review it shortly.",
  },
  under_review: {
    label: "Under review",
    description: "Kaziin is reviewing your profile and stated preferences.",
  },
  support_available: {
    label: "Support option available",
    description: "A team member has identified a possible next step and will share the details.",
  },
  not_eligible: {
    label: "Application in Progress",
    description: "Our team is working to identify the right support pathway for you. Keep your profile updated to improve your match.",
  },
} as const;

export type GlobalInterestStatus = keyof typeof GLOBAL_INTEREST_STATUSES;

export function getGlobalInterestStatus(value: string | null | undefined) {
  if (value && value in GLOBAL_INTEREST_STATUSES) {
    return GLOBAL_INTEREST_STATUSES[value as GlobalInterestStatus];
  }

  return GLOBAL_INTEREST_STATUSES.received;
}

export function labelForValue(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
) {
  return options.find((option) => option.value === value)?.label ?? value ?? "Not provided";
}
