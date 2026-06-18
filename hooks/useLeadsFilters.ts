"use client";

// Next.js
import { useState } from "react";

// Types
import type { LeadStatus } from "@/types/leads";

export type StatusFilter = LeadStatus | "all";
export type LeadsFilters = ReturnType<typeof useLeadsFilters>;

export function useLeadsFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  return { search, setSearch, status, setStatus };
}
