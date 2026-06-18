// HTML Components
import { Badge } from "@/components/ui/badge";

// Libs
import { LEAD_STATUS_META } from "@/constants/leads";
import { cn } from "@/lib/utils";

// Types
import type { LeadStatus } from "@/types/leads";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = LEAD_STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border-transparent px-2.5 font-normal", meta.tone)}
    >
      {meta.label}
    </Badge>
  );
}
