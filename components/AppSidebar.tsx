"use client";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// HTML Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, Settings, Users } from "lucide-react";

// Libs
import { AGENCY } from "@/constants/agency";
import { displayToast } from "@/lib/helpers/toast";

const NAV = [
  {
    label: "Pipeline",
    items: [{ title: "Leads", href: "/leads", icon: Users }],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader>
        <button
          type="button"
          onClick={() =>
            displayToast(
              "Workspace switcher",
              "info",
              "This feature is not yet available.",
            )
          }
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
            W
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {AGENCY.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Lead pipeline
            </p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="data-[active=true]:font-medium"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <button
          type="button"
          onClick={() =>
            displayToast(
              "Account menu",
              "info",
              "This feature is not yet available.",
            )
          }
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-accent-subtle text-xs font-medium text-primary">
              {AGENCY.senderName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              {AGENCY.senderFullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {AGENCY.email}
            </p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
