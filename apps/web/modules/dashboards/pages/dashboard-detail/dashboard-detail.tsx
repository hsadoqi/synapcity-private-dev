"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"

import { Button, ErrorState } from "@workspace/ui/components"
import { DashboardCanvas } from "./components/dashboard-canvas"
import { WidgetRenderer } from "./components/widget-renderer"
import { dashboardDetailStyles } from "./dashboard-detail.styles"
import { loadDashboardById } from "@/modules/dashboards/services/dashboard-data"
import {
  createDashboardWidget,
  createLayoutItem,
  loadDashboardLayout,
  loadDashboardWidgets,
  saveDashboardLayout,
  saveDashboardWidgets,
} from "@/modules/dashboards/services/dashboard-layout-data"
import type {
  DashboardLayout,
  WidgetInstance,
} from "@/modules/dashboards/types"

interface DashboardDetailPageProps {
  dashboardId: string
}

export function DashboardDetailPage({ dashboardId }: DashboardDetailPageProps) {
  const dashboardState = React.useMemo(() => {
    try {
      return {
        dashboard: loadDashboardById(dashboardId),
        layout: loadDashboardLayout(dashboardId),
        status: "ready" as const,
        widgets: loadDashboardWidgets(dashboardId),
      }
    } catch {
      return {
        dashboard: null,
        layout: {
          dashboardId,
          breakpoint: "lg" as const,
          items: [],
        },
        status: "error" as const,
        widgets: [] as WidgetInstance[],
      }
    }
  }, [dashboardId])

  const [isEditing, setIsEditing] = React.useState(false)
  const [selectedWidget, setSelectedWidget] = React.useState("document-card")
  const [widgets, setWidgets] = React.useState<WidgetInstance[]>(
    dashboardState.widgets
  )
  const [layout, setLayout] = React.useState<DashboardLayout>(
    dashboardState.layout
  )

  const handleAddWidget = (widgetType: string) => {
    const nextWidget = createDashboardWidget(
      widgetType,
      `${widgetType} widget`,
      dashboardId
    )
    const nextWidgets = [...widgets, nextWidget]
    const nextLayoutItems = [
      ...layout.items,
      createLayoutItem(nextWidget.id, layout.items.length),
    ]

    setWidgets(nextWidgets)
    setLayout({ ...layout, items: nextLayoutItems })
    saveDashboardWidgets(dashboardId, nextWidgets)
    saveDashboardLayout(dashboardId, { ...layout, items: nextLayoutItems })
  }

  if (dashboardState.status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <ErrorState
          title="Couldn’t load this dashboard"
          description="The dashboard data could not be read from local storage."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboards">Back to dashboards</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (!dashboardState.dashboard) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <ErrorState
          icon={<LayoutDashboard className="size-10" aria-hidden="true" />}
          title="Dashboard not found"
          description="This dashboard no longer exists in local storage."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboards">Back to dashboards</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className={dashboardDetailStyles.page}>
      <div className={dashboardDetailStyles.heading}>
        <p className={dashboardDetailStyles.eyebrow}>Dashboard</p>
        <h1 className={dashboardDetailStyles.title}>
          {dashboardState.dashboard.title}
        </h1>
        <p className={dashboardDetailStyles.description}>
          Edit mode now persists widget additions and layout slots for the
          current dashboard.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Widget type</span>
        <select
          value={selectedWidget}
          onChange={(event) => setSelectedWidget(event.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
        >
          <option value="document-card">Document widget</option>
          <option value="text-block">Text widget</option>
        </select>
      </label>

      <DashboardCanvas
        dashboardId={dashboardId}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((current) => !current)}
        widgets={widgets}
        layout={layout}
        onAddWidget={handleAddWidget}
      />
      <WidgetRenderer
        dashboardId={dashboardId}
        selectedWidget={selectedWidget}
      />
    </div>
  )
}
