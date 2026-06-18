// Libs
import { getScoreBarColors } from "@/lib/helpers/scoreBars";

interface ScoreBarsProps {
  score: number | null;
}

export const ScoreBars = ({ score }: ScoreBarsProps) => {
  if (score === null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-[3px]" aria-hidden>
        {getScoreBarColors(score).map((color, i) => (
          <span
            key={i}
            className="h-4 w-[2px] rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="rounded-md border border-border px-1.5 py-0.5 text-xs tabular-nums text-foreground">
        {Math.round(score / 10)}/10
      </span>
    </div>
  );
};
