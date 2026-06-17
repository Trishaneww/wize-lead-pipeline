export const CHANNELS = {
  web_design: {
    key: "web_design",
    label: "Website Modernization",
    available: true,
    offer:
      "a quick call to walk through a free mockup of a refreshed version of their site, and the specific changes that would keep more visitors on the page and turn them into calls/bookings",
    qualifyFocus: [
      `We help local and older businesses MODERNIZE their web presence so the website does the selling — a strong first impression, visible trust, and an easy path to call/book — letting the owner focus on their actual work.`,
      ``,
      `A GOOD lead is a business whose website UNDER-SERVES it: the site looks dated or a step behind newer competitors, the first impression is weak, trust signals (reviews, credentials, years in business) aren't surfaced up top, there's no obvious tap-to-call or clear next step, or it generally won't convert a visitor into a call/booking. A strong, well-reviewed business with a weak site is the IDEAL lead — the reputation is there, the site just isn't carrying it across.`,
      ``,
      `A POOR lead has no website at all (nothing to modernize — that's a rebuild, flag it), or already has a modern, polished, conversion-focused site with little to improve.`,
      ``,
      `Do NOT treat page speed as the headline problem in general. Owners do not care about technical metrics. Judge primarily on the first impression, trust, and customer experience — not Lighthouse scores.`,
      ``,
      `EXCEPTION — extremely slow sites: if the audit reports the site is extremely slow (main content takes 10+ seconds to appear on mobile — an "extremely slow" finding), that alone is a qualifying problem, EVEN IF the design looks modern. In that case, qualify the lead and make the angle the slow load framed as customer impact — e.g. "your site looks great, but it takes 13 seconds to load on mobile, so most visitors leave before they ever see it." Never frame it as a Lighthouse score.`,
    ].join("\n"),
    draftFocus: [
      `Write a warm, professional, personable outreach email — advisor to business owner, not technician to technician. Structure:`,
      `1. Open with genuine, SPECIFIC praise grounded in something real you can verify from their site/screenshot (their reputation, years in business, credentials, reviews, quality of work). Acknowledge they've got the hard part figured out.`,
      `2. Pivot to the missed opportunity (the angle): their website isn't doing that reputation justice / is quietly costing them calls or bookings. Tie it to real customer behavior (visitors hesitate, click off, can't find the next step, go to a competitor).`,
      `3. Give ONE concrete, genuinely useful piece of free advice they can act on today — with or without you. Explain briefly why it helps. This makes it helpful, not transactional.`,
      `4. One sentence of intro: who you are and what the agency does.`,
      `5. Offer to hop on a quick call to show a mockup and walk through the specific changes that improve retention/bookings.`,
      `6. A friendly, respectful opt-out so it never feels pushy.`,
      ``,
      `Lead with the angle you're given. Never cite technical metrics like Lighthouse/PageSpeed scores; if the angle is about load time, frame it purely as the visitor's experience (how many seconds before they see anything, and that they leave first). Even a speed-led email still opens with genuine praise before the pivot.`,
      `Keep it tight — ~180 words max. Every sentence earns its place; cut anything that doesn't move the reader.`,
    ].join("\n"),
  },

  custom_software: {
    key: "custom_software",
    label: "Custom Software & Integrations",
    available: false,
    offer:
      "a discovery call about building a custom platform, app, or integration that removes a manual bottleneck in their business",
    qualifyFocus:
      "PLACEHOLDER — the custom-software channel is not yet built. Its qualifying signal is operational pain (manual processes, no client portal/booking, spreadsheets, hiring developers), which a website audit cannot detect. Sourcing must be designed before this channel runs.",
    draftFocus:
      "PLACEHOLDER — not yet built. Will lead with an operational missed opportunity and offer a discovery call about a custom build.",
  },
} as const;

export type Channel = keyof typeof CHANNELS;
export type ChannelConfig = (typeof CHANNELS)[Channel];

export const DEFAULT_CHANNEL: Channel = "web_design";
