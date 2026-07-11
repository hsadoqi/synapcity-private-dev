// // // Replaces the previous stock header (hardcoded "Build Your Application /
// // // Data Fetching" breadcrumb text, and imports from a flat
// // // "@workspace/ui/components" barrel that no longer exists). Ported and
// // // adapted from synapcity-theme/apps/web/app/(app)/_components/app-header.tsx.
// // // There's no Breadcrumb primitive in packages/ui yet in either fork —
// // // theme's version doesn't use one either, it hand-rolls a route-aware
// // // breadcrumb off getAppRouteContext(), which is what this does too.
"use client"
import { SidebarTrigger, BreadcrumbList, BreadcrumbLink } from "@workspace/ui/components"
import { ChevronRight } from "lucide-react"

import { getAppRouteContext, type AppRouteContext } from "@/modules/routing"
import { AppGlobalActions } from "@/app/(home)/_components/header/header-actions"
import { usePathname } from "next/navigation"

function formatEntityLabel(routeContext: AppRouteContext) {
  if (!routeContext.entityId) return routeContext.title

  return routeContext.entityId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function HeaderBreadcrumbs({ routeContext }: { routeContext: AppRouteContext }) {
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

  if (!routeContext.entityId) {
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
    <BreadcrumbList>
    {/* <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm"> */}
      <BreadcrumbLink
        href={routeContext.section === "theme-settings" ? "/" : sectionHref}
        className="truncate text-muted-foreground hover:text-foreground"
        >
        {sectionLabel}
      </BreadcrumbLink>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium text-foreground">
        {routeContext.section === "theme-settings"
          ? "Themes"
          : formatEntityLabel(routeContext)}
      </span>
      </BreadcrumbList>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/82">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger
              className="-ml-1 text-muted-foreground hover:text-foreground"
              aria-label="Toggle main sidebar"
            />
            <div className="h-5 w-px bg-border" aria-hidden="true" />
            <HeaderBreadcrumbs routeContext={routeContext} />
          </div>
        </div>
        <AppGlobalActions routeContext={routeContext} />
      </div>
    </header>
  )
}
