interface DashboardCanvasProps {
  dashboardId: string
}

export function DashboardCanvas({ dashboardId }: DashboardCanvasProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Dashboard canvas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder composition surface for dashboard {dashboardId}.
          </p>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
          View / Edit
        </div>
      </div>
    </div>
  )
}
