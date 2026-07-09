import { getWidgetDefinition } from "@/modules/widgets"

interface WidgetRendererProps {
  dashboardId: string
}

export function WidgetRenderer({ dashboardId }: WidgetRendererProps) {
  const widget = getWidgetDefinition("document-card")

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">Widget renderer</div>
      <h3 className="mt-1 text-lg font-medium">{widget?.label ?? "Placeholder widget"}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Dashboard {dashboardId} is wired to the basic registry foundation.
      </p>
    </div>
  )
}
