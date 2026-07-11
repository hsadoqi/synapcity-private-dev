import { ContextualPanelLayout } from "../_components/contextual-panel-layout"

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ContextualPanelLayout>{children}</ContextualPanelLayout>
}
