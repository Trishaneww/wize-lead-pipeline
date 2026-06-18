"use client";

// Libs
import { Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  id: string;
  className?: string;
  width?: number;
  height?: number;
}

export const Sparkline = ({
  data,
  id,
  className,
  width = 108,
  height = 44,
}: SparklineProps) => {
  if (data.length < 2) return null;

  const chartData = data.map((value, i) => ({ i, value }));
  const gradientId = `spark-${id.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <AreaChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-primary)"
            stopOpacity={0.18}
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary)"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke="var(--color-primary)"
        strokeWidth={2}
        fill={`url(#${gradientId})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  );
};
