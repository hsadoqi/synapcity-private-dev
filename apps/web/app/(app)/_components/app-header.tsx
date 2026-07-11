"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  getAppRouteContext,
  type AppRouteContext,
} from "@/modules/routing"
import { SidebarTrigger } from "@workspace/ui/components/primitives/sidebar"
import { AppGlobalActions } from "./header-actions"

function formatEntityLabel(routeContext: AppRouteContext) {
  if (!routeContext.entityId) return routeContext.title

  return routeContext.entityId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function HeaderBreadcrumbs({
  routeContext,
}: {
  routeContext: AppRouteContext
}) {
  const sectionHref =
    routeContext.entityType === "dashboard" ? "/dashboards" : "/documents"
  const sectionLabel =
    routeContext.section === "dashboard" || routeContext.section === "dashboards"
      ? "Dashboards"
      : routeContext.section === "theme-settings"
        ? "Settings"
        : routeContext.section === "home"
          ? "Synapcity"
          : "Documents"

  if (!routeContext.entityId && routeContext.section !== "theme-settings") {
    return (
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {sectionLabel}
        </div>
        <div className="hidden truncate text-xs text-muted-foreground sm:block">
          {routeContext.description}
        </div>
      </div>
    )
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      <Link
        href={routeContext.section === "theme-settings" ? "/" : sectionHref}
        className="truncate text-muted-foreground hover:text-foreground"
      >
        {sectionLabel}
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium text-foreground">
        {routeContext.section === "theme-settings"
          ? "Themes"
          : formatEntityLabel(routeContext)}
      </span>
    </nav>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/82">
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger
            className="-ml-1 text-muted-foreground hover:text-foreground"
            aria-label="Toggle main sidebar"
          />
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <HeaderBreadcrumbs routeContext={routeContext} />
        </div>

        <AppGlobalActions routeContext={routeContext} />
      </div>
    </header>
  )
}
