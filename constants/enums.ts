export const LEAD_SOURCES = ["places", "csv", "manual"] as const;
export const LEAD_CHANNELS = ["web_design", "custom_software"] as const;
export const DRAFT_STATUSES = [
  "generated",
  "edited",
  "approved",
  "rejected",
] as const;
export const LEAD_STATUSES = [
  "new",
  "auditing",
  "qualified",
  "disqualified",
  "drafting",
  "drafted",
  "approved",
  "draft_created",
  "replied",
  "archived",
  "failed",
] as const;
