// Libs
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type DailyLeadCount = {
  date: string;
  total: number;
  qualified: number;
  drafted: number;
  needsReview: number;
};

export async function getDailyLeadCounts(days = 14): Promise<DailyLeadCount[]> {
  const result = await db.execute(sql`
    select
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
      count(*) as total,
      count(*) filter (
        where qualification_score is not null and status <> 'disqualified'
      ) as qualified,
      count(*) filter (
        where status in ('drafted', 'approved', 'draft_created')
      ) as drafted,
      count(*) filter (where status = 'drafted') as "needsReview"
    from leads
    where created_at >= now() - make_interval(days => ${days})
    group by 1
    order by 1
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    date: String(row.date),
    total: Number(row.total),
    qualified: Number(row.qualified),
    drafted: Number(row.drafted),
    needsReview: Number(row.needsReview),
  }));
}
