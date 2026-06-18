"use client";

// Next.js
import { useMemo, useState } from "react";

// Hooks
import type { LeadsFilters } from "@/hooks/useLeadsFilters";

// Types
import type { LeadListItem } from "@/types/leads";

export type SortKey =
  | "businessName"
  | "city"
  | "qualificationScore"
  | "updatedAt";
type SortState = { key: SortKey; dir: "asc" | "desc" };

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function useLeadsTable(leads: LeadListItem[], filters: LeadsFilters) {
  const [sort, setSort] = useState<SortState>({
    key: "updatedAt",
    dir: "desc",
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filters.status !== "all" && lead.status !== filters.status)
        return false;
      if (!q) return true;
      return (
        lead.businessName.toLowerCase().includes(q) ||
        (lead.city ?? "").toLowerCase().includes(q) ||
        (lead.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, filters.search, filters.status]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort(
      (a, b) => compareLeads(a, b, sort.key) * (sort.dir === "asc" ? 1 : -1),
    );
    return rows;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(total, safePage * pageSize + pageSize);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
    setPage(0);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(0);
  };

  return {
    rows,
    total,
    start,
    end,
    sort,
    toggleSort,
    page: safePage,
    pageCount,
    setPage,
    pageSize,
    setPageSize,
  };
}

function compareLeads(a: LeadListItem, b: LeadListItem, key: SortKey): number {
  switch (key) {
    case "qualificationScore":
      return (a.qualificationScore ?? -1) - (b.qualificationScore ?? -1);
    case "updatedAt":
      return a.updatedAt.localeCompare(b.updatedAt);
    default:
      return (a[key] ?? "").localeCompare(b[key] ?? "");
  }
}
