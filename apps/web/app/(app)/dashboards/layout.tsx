import { ContextualPanelLayout } from "../_components/contextual-panel-layout"
import { DashboardProviders } from "./dashboard-providers"

export default async function DashboardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProviders>
      <ContextualPanelLayout>{children}</ContextualPanelLayout>
    </DashboardProviders>
  )
}
