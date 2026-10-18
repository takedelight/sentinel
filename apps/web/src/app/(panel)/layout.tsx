"use client";

import { Button } from "@sentinel/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@sentinel/ui/components/sidebar";
import { Spinner } from "@sentinel/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sentinel/ui/components/tooltip";
import { LayoutDashboard, Pause, Play, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/features/auth/model";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { formatNumber } from "@/shared/lib/format";
import { TICK_SECONDS } from "@/shared/mock/data";
import { setPaused, usePaused, useUnseenEvents } from "@/shared/mock/simulator";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/events", label: "Журнал подій", icon: ScrollText },
];

function isItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === href || pathname.startsWith("/devices/");
  }

  return pathname === href;
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const paused = usePaused();
  const unseenEvents = useUnseenEvents();

  useEffect(() => {
    if (ready && !session) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const initials = session.name.slice(0, 1).toUpperCase();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Sentinel</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Моніторинг вузлів
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Моніторинг</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isItemActive(item.href, pathname)}
                        tooltip={item.label}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.href === "/events" && unseenEvents > 0 ? (
                        <SidebarMenuBadge>
                          {unseenEvents > 99 ? "99+" : unseenEvents}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-medium">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{session.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{session.email}</span>
                  </div>
                  <LogoutButton />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div aria-hidden="true" className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">Панель моніторингу</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={paused ? "Відновити оновлення" : "Призупинити оновлення"}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setPaused(!paused)}
                    />
                  }
                >
                  {paused ? <Play /> : <Pause />}
                </TooltipTrigger>
                <TooltipContent>
                  {paused ? "Відновити оновлення" : "Призупинити оновлення"}
                </TooltipContent>
              </Tooltip>
              <span className="flex items-center gap-2 pl-1.5 text-xs text-muted-foreground">
                <span aria-hidden="true" className="relative flex size-2">
                  {paused ? (
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                  ) : (
                    <>
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </>
                  )}
                </span>
                {paused
                  ? "оновлення призупинено"
                  : `оновлення кожні ${formatNumber(TICK_SECONDS)} с`}
              </span>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
