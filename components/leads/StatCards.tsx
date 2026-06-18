// HTML Components
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

// Components
import { Sparkline } from "@/components/leads/Sparkline";

// Libs
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: number | string;
  delta?: { value: string; positive: boolean };
  series: number[];
}

export const StatCards = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-none">
          <CardContent className="px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  {stat.delta && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-medium",
                        stat.delta.positive
                          ? "text-emerald-600"
                          : "text-red-600",
                      )}
                    >
                      {stat.delta.positive ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {stat.delta.value}
                    </span>
                  )}
                </div>
              </div>
              <Sparkline
                data={stat.series}
                id={stat.label}
                className="mt-1 shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
