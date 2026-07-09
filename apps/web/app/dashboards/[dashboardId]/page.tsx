import { DashboardDetailPage } from "@/modules/dashboards"

interface DashboardDetailRouteProps {
  params: Promise<{ dashboardId: string }>
}

export default async function DashboardDetailRoute({
  params,
}: DashboardDetailRouteProps) {
  const { dashboardId } = await params
  return <DashboardDetailPage dashboardId={dashboardId} />
}
