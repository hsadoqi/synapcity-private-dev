"use client"

import * as React from "react"

import { getWidgetDefinition } from "@/modules/widgets"

interface WidgetRendererProps {
  dashboardId: string
  selectedWidget?: string
}

export function WidgetRenderer({
  dashboardId,
  selectedWidget = "document-card",
}: WidgetRendererProps) {
  const widget = getWidgetDefinition(selectedWidget)

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">Widget renderer</div>
      <h3 className="mt-1 text-lg font-medium">
        {widget?.label ?? "Placeholder widget"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Dashboard {dashboardId} is wired to the basic registry foundation and
        can switch widget types.
      </p>
      <div className="mt-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        Current widget type: {selectedWidget}
      </div>
    </div>
  )
}
