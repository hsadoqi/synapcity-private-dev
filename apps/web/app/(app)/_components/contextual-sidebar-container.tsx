"use client"

import { usePathname } from "next/navigation"
import {
  Activity,
  FileText,
  Info,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
} from "lucide-react"

import { getAppRouteContext } from "@/modules/routing"

function ContextRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid gap-1 border-b border-border py-2 last:border-b-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-xs text-foreground">{value}</dd>
    </div>
  )
}

export function ContextualSidebarContainer({
  collapsed = false,
  onCollapsedChange,
}: {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)
  const isDashboard =
    routeContext.section === "dashboard" || routeContext.section === "dashboards"
  const isDetail =
    routeContext.section === "dashboard" || routeContext.section === "document"

  const icon = isDashboard ? (
    <LayoutGrid className="size-4" />
  ) : routeContext.section === "document" ? (
    <FileText className="size-4" />
  ) : (
    <Info className="size-4" />
  )

  if (collapsed) {
    return (
      <aside
        aria-label="Context panel"
        className="flex h-full min-h-0 min-w-14 flex-col items-center border-l bg-background py-3"
      >
        <button
          type="button"
          aria-label="Expand context panel"
          title="Expand context panel"
          onClick={() => onCollapsedChange?.(false)}
          className="flex size-9 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <PanelRightOpen className="size-4" />
        </button>

        <div className="mt-3 flex size-9 items-center justify-center bg-accent text-accent-foreground">
          {icon}
        </div>

        <div className="mt-4 h-px w-6 bg-border" />

        <nav aria-label="Context panel shortcuts" className="mt-4 grid gap-1">
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            className="flex size-9 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Settings2 className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Activity"
            title="Activity"
            className="flex size-9 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Activity className="size-4" />
          </button>
        </nav>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Context panel"
      className="flex h-full min-h-0 min-w-[260px] flex-col border-l bg-background"
    >
      <header className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center bg-accent text-accent-foreground">
              {icon}
            </div>
            <div className="grid min-w-0 gap-0.5">
              <h2 className="truncate text-sm font-medium text-foreground">
                {isDetail
                  ? `${routeContext.entityType} context`
                  : `${routeContext.title} context`}
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {isDetail
                  ? "Object and selection metadata"
                  : "Controls for the current view"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Collapse context panel"
            title="Collapse context panel"
            onClick={() => onCollapsedChange?.(true)}
            className="flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <PanelRightClose className="size-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            {isDetail ? "Properties" : "View state"}
          </h3>
          <dl>
            <ContextRow
              label="Scope"
              value={
                isDetail
                  ? routeContext.entityType
                  : isDashboard
                    ? "Dashboard index"
                    : "Document index"
              }
            />
            <ContextRow
              label="Selection"
              value={
                isDetail
                  ? isDashboard
                    ? "No widget selected"
                    : "No block selected"
                  : "All objects"
              }
            />
            <ContextRow
              label="Theme"
              value={isDetail ? "Inherits unless explicitly assigned" : "Root app theme"}
            />
          </dl>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">Panels</h3>
          <div className="grid gap-1 text-xs">
            <button
              type="button"
              className="flex h-9 items-center gap-2 px-2 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Settings2 className="size-4" />
              Settings
            </button>
            <button
              type="button"
              className="flex h-9 items-center gap-2 px-2 text-left hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Activity className="size-4" />
              Activity
            </button>
          </div>
        </section>
      </div>
    </aside>
  )
}
