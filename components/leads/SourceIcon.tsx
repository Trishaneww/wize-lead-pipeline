// HTML Components
import { Globe, MapPin, Upload, UserPlus } from "lucide-react";

// Types
import type { LeadListItem } from "@/types/leads";

const SOURCE_META: Record<
  LeadListItem["source"],
  { label: string; icon: typeof Globe }
> = {
  places: { label: "Places", icon: MapPin },
  csv: { label: "CSV", icon: Upload },
  manual: { label: "Manual", icon: UserPlus },
};

export const SourceIcon = ({ source }: { source: LeadListItem["source"] }) => {
  const meta = SOURCE_META[source] ?? { label: source, icon: Globe };
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
};
