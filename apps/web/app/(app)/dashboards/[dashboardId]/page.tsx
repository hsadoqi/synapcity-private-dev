import { DashboardDetailPage } from "@/modules/dashboards"
import { ThemeScopeProvider } from "@/modules/theme"

interface DashboardDetailRouteProps {
  params: Promise<{ dashboardId: string }>
}

export default async function DashboardDetailRoute({
  params,
}: DashboardDetailRouteProps) {
  const { dashboardId } = await params
  return (
    <ThemeScopeProvider scope="dashboard" scopeId={dashboardId}>
      <DashboardDetailPage key={dashboardId} dashboardId={dashboardId} />
    </ThemeScopeProvider>
  )
}
