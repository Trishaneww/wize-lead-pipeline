// Types
import type { LeadListItem } from "@/types/leads";
import type { DailyLeadCount } from "@/lib/queries/stats";
import type { Stat } from "@/components/leads/StatCards";

type Category = "total" | "qualified" | "drafted" | "needsReview";

const PREDICATES: Record<
  Exclude<Category, "total">,
  (lead: LeadListItem) => boolean
> = {
  qualified: (l) =>
    l.qualificationScore !== null && l.status !== "disqualified",
  drafted: (l) => ["drafted", "approved", "draft_created"].includes(l.status),
  needsReview: (l) => l.status === "drafted",
};

const CARDS: { label: string; key: Category }[] = [
  { label: "Total leads", key: "total" },
  { label: "Qualified", key: "qualified" },
  { label: "Drafted", key: "drafted" },
  { label: "Needs review", key: "needsReview" },
];

export function buildStatCards(
  leads: LeadListItem[],
  daily: DailyLeadCount[],
  days = 14,
): Stat[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const dates = lastNDates(days);

  return CARDS.map(({ label, key }) => {
    const series = dates.map((date) => Number(byDate.get(date)?.[key] ?? 0));
    const value =
      key === "total" ? leads.length : leads.filter(PREDICATES[key]).length;
    return { label, value, series, delta: computeDelta(series) };
  });
}

export function computeDelta(series: number[]): Stat["delta"] {
  const half = Math.floor(series.length / 2);
  if (half === 0) return undefined;
  const prior = sum(
    series.slice(series.length - 2 * half, series.length - half),
  );
  const current = sum(series.slice(series.length - half));
  if (prior === 0) {
    return current > 0 ? { value: "new", positive: true } : undefined;
  }
  const pct = Math.round(((current - prior) / prior) * 100);
  return { value: `${pct}%`, positive: current >= prior };
}

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
