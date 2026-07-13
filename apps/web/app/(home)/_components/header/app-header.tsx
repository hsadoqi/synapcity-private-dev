"use client"
import {
  BreadcrumbLink,
  BreadcrumbList,
  Button,
  SidebarTrigger,
} from "@workspace/ui/components"
import { ChevronRight, PanelRight } from "lucide-react"
import { usePathname } from "next/navigation"

import { getAppRouteContext, type AppRouteContext } from "@/modules/routing"
import { AppGlobalActions } from "@/app/(home)/_components/header/header-actions"
import { loadDashboardById } from "@/modules/dashboards/services/dashboard-data"
import { loadDocumentById } from "@/modules/documents/services/document-data"

function formatEntityLabel(routeContext: AppRouteContext) {
  if (!routeContext.entityId) return routeContext.title
  let foundEntity = null

  if (routeContext.entityType === "dashboard") {
    foundEntity = loadDashboardById(routeContext.entityId)
  } else if (routeContext.entityType === "document") {
    foundEntity = loadDocumentById(routeContext.entityId)
  }
  return (
    foundEntity?.title ??
    routeContext.entityId
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  )
}

function HeaderBreadcrumbs({
  routeContext,
}: {
  routeContext: AppRouteContext
}) {
  const sectionHref =
    routeContext.entityType === "dashboard" ? "/dashboards" : "/documents"
  const sectionLabel =
    routeContext.section === "dashboard" ||
    routeContext.section === "dashboards"
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

export function AppHeader({
  onOpenContextPanel,
}: {
  onOpenContextPanel?: () => void
}) {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/82">
      <div className="flex w-full items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3">
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open context panel"
          onClick={onOpenContextPanel}
        >
          <PanelRight />
        </Button>
      </div>
    </header>
  )
}
