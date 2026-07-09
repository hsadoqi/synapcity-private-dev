"use client"

import * as React from "react"

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
  DashboardRecord,
  DashboardLayout,
  WidgetInstance,
} from "@/modules/dashboards/types"

interface DashboardDetailPageProps {
  dashboardId: string
}

export function DashboardDetailPage({ dashboardId }: DashboardDetailPageProps) {
  const [dashboard, setDashboard] = React.useState<DashboardRecord | null>(() =>
    loadDashboardById(dashboardId)
  )
  const [isEditing, setIsEditing] = React.useState(false)
  const [selectedWidget, setSelectedWidget] = React.useState("document-card")
  const [widgets, setWidgets] = React.useState<WidgetInstance[]>(() =>
    loadDashboardWidgets(dashboardId)
  )
  const [layout, setLayout] = React.useState<DashboardLayout>(() =>
    loadDashboardLayout(dashboardId)
  )

  React.useEffect(() => {
    setDashboard(loadDashboardById(dashboardId))
    setWidgets(loadDashboardWidgets(dashboardId))
    setLayout(loadDashboardLayout(dashboardId))
    setIsEditing(false)
  }, [dashboardId])

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

  return (
    <div className={dashboardDetailStyles.page}>
      <div className={dashboardDetailStyles.heading}>
        <p className={dashboardDetailStyles.eyebrow}>Dashboard</p>
        <h1 className={dashboardDetailStyles.title}>
          {dashboard?.title ?? `Dashboard ${dashboardId}`}
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
