export const AGENCY = {
  name: "Wize Studios",
  senderName: "Trishane",
  senderFullName: "Trishane Anthony",
  website: "https://wizestudios.ca",
  websiteDisplay: "wizestudios.ca",
  phone: "647-472-4119",
  email: "trishaneww@gmail.com",
  mailingAddress: "4125 Montrose Crescent, Burlington, ON L7M 4J4",
  positioning:
    "We modernize websites for local businesses so the site does the selling and the owner can stay focused on the work.",
} as const;

export const SIGNATURE = `${AGENCY.senderFullName}\n${AGENCY.name} · ${AGENCY.websiteDisplay} · ${AGENCY.phone}`;
export const OPT_OUT_LINE =
  "If the timing's off or it's not for you, no worries — just let me know and I won't follow up.";
