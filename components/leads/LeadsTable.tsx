"use client";

// Next.js
import { useState } from "react";

// HTML Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LayoutGrid,
  ListFilter,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

// Components
import { StatusBadge } from "@/components/leads/StatusBadge";
import { LeadSheet } from "@/components/leads/LeadSheet";
import { ScoreBars } from "@/components/leads/ScoreBars";
import { SourceIcon } from "@/components/leads/SourceIcon";

// Libs
import { formatRelativeDate, getInitials } from "@/lib/helpers/format";
import { getPaginationRange } from "@/lib/helpers/pagination";
import { displayToast } from "@/lib/helpers/toast";
import { cn } from "@/lib/utils";

// Hooks
import { useLeadsFilters } from "@/hooks/useLeadsFilters";
import { PAGE_SIZE_OPTIONS, useLeadsTable } from "@/hooks/useLeadsTable";

// Types
import type { StatusFilter } from "@/hooks/useLeadsFilters";
import type { SortKey } from "@/hooks/useLeadsTable";
import type { LeadListItem } from "@/types/leads";

const TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Qualified", value: "qualified" },
  { label: "Drafted", value: "drafted" },
  { label: "Approved", value: "approved" },
  { label: "Disqualified", value: "disqualified" },
];

export const LeadsTable = ({ leads }: { leads: LeadListItem[] }) => {
  const filters = useLeadsFilters();
  const {
    rows,
    total,
    start,
    end,
    sort,
    toggleSort,
    page,
    pageCount,
    setPage,
    pageSize,
    setPageSize,
  } = useLeadsTable(leads, filters);
  const [selected, setSelected] = useState<LeadListItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openLead = (lead: LeadListItem) => {
    setSelected(lead);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs status={filters.status} onChange={filters.setStatus} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search business, city, category…"
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <ToolbarIcon
          label="Filters"
          onClick={() =>
            displayToast(
              "Advanced filters",
              "info",
              "This feature is not yet available.",
            )
          }
        >
          <ListFilter className="size-4" />
        </ToolbarIcon>
        <ToolbarIcon
          label="Sort"
          onClick={() =>
            displayToast(
              "Sort options",
              "info",
              "This feature is not yet available.",
            )
          }
        >
          <SlidersHorizontal className="size-4" />
        </ToolbarIcon>
        <div className="ml-auto flex items-center gap-2">
          <ToolbarIcon
            label="Board view"
            onClick={() =>
              displayToast(
                "Board view",
                "info",
                "This feature is not yet available.",
              )
            }
          >
            <LayoutGrid className="size-4" />
          </ToolbarIcon>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              displayToast(
                "Export",
                "info",
                "This feature is not yet available.",
              )
            }
          >
            <Upload className="size-4" /> Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead
                label="Business"
                sortKey="businessName"
                sort={sort}
                onSort={toggleSort}
              />
              <TableHead>Category</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <SortableHead
                label="Score"
                sortKey="qualificationScore"
                sort={sort}
                onSort={toggleSort}
              />
              <SortableHead
                label="Updated"
                sortKey="updatedAt"
                sort={sort}
                onSort={toggleSort}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No leads match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-accent-subtle text-xs font-medium text-primary">
                          {getInitials(lead.businessName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate font-medium text-foreground">
                          {lead.businessName}
                        </p>
                        {lead.city && (
                          <p className="truncate text-xs text-muted-foreground">
                            {lead.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.category ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <SourceIcon source={lead.source} />
                  </TableCell>
                  <TableCell>
                    <ScoreBars score={lead.qualificationScore} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRelativeDate(lead.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LeadsPagination page={page} pageCount={pageCount} onPage={setPage} />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">
            Showing {start} - {end} of {total}
          </span>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Listings per Page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <LeadSheet lead={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

const Tabs = ({
  status,
  onChange,
}: {
  status: StatusFilter;
  onChange: (s: StatusFilter) => void;
}) => {
  return (
    <div className="flex items-center border-b border-border">
      {TABS.map((tab) => {
        const active = status === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const ToolbarIcon = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-9"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </Button>
  );
};

const SortableHead = ({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
}) => {
  const active = sort.key === sortKey;
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  );
};

const LeadsPagination = ({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) => {
  const onFirst = page === 0;
  const onLast = page >= pageCount - 1;
  const disabled = "pointer-events-none opacity-40";

  return (
    <Pagination className="mx-0 w-auto justify-start">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon-sm"
            aria-label="Previous page"
            className={cn(onFirst && disabled)}
            onClick={(e) => {
              e.preventDefault();
              if (!onFirst) onPage(page - 1);
            }}
          >
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>

        {getPaginationRange(page, pageCount).map((item, i) => (
          <PaginationItem key={i}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                size="icon-sm"
                isActive={item - 1 === page}
                className={cn(
                  item - 1 === page &&
                    "border-transparent bg-accent font-medium text-foreground",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onPage(item - 1);
                }}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon-sm"
            aria-label="Next page"
            className={cn(onLast && disabled)}
            onClick={(e) => {
              e.preventDefault();
              if (!onLast) onPage(page + 1);
            }}
          >
            <ChevronRight />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
