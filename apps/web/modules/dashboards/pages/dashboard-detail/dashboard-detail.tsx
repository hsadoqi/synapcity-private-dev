import { DashboardCanvas } from "./components/dashboard-canvas"
import { WidgetRenderer } from "./components/widget-renderer"

interface DashboardDetailPageProps {
  dashboardId: string
}

export function DashboardDetailPage({ dashboardId }: DashboardDetailPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard {dashboardId}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View/edit mode placeholder with widget composition scaffolding.
        </p>
      </div>

      <DashboardCanvas dashboardId={dashboardId} />
      <WidgetRenderer dashboardId={dashboardId} />
    </div>
  )
}
