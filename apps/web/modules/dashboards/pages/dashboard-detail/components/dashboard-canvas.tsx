"use client"

import * as React from "react"

import type {
  DashboardLayout,
  WidgetInstance,
} from "@/modules/dashboards/types"

interface DashboardCanvasProps {
  dashboardId: string
  isEditing?: boolean
  onToggleEdit?: () => void
  widgets?: WidgetInstance[]
  layout?: DashboardLayout
  onAddWidget?: (widgetType: string) => void
}

export function DashboardCanvas({
  dashboardId,
  isEditing = false,
  onToggleEdit,
  widgets = [],
  layout,
  onAddWidget,
}: DashboardCanvasProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Dashboard canvas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? `Editing layout for dashboard ${dashboardId}.`
              : `View mode for dashboard ${dashboardId}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleEdit}
          className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition hover:border-primary"
        >
          {isEditing ? "Exit edit" : "Edit mode"}
        </button>
      </div>

      {isEditing ? (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAddWidget?.("document-card")}
              className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary"
            >
              Add document widget
            </button>
            <button
              type="button"
              onClick={() => onAddWidget?.("text-block")}
              className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary"
            >
              Add text widget
            </button>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Layout slots: {layout?.items.length ?? 0}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {widgets.length > 0 ? (
          widgets.map((widget) => (
            <div
              key={widget.id}
              className="rounded-lg border border-border bg-background/70 p-4"
            >
              <div className="text-sm font-medium">
                {widget.title ?? widget.widgetType}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {widget.widgetType}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No widgets yet. Add one to start building the dashboard.
          </div>
        )}
      </div>
    </div>
  )
}
