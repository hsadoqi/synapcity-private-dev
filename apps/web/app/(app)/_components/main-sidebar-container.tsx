import { SidebarInset } from "@workspace/ui/components/primitives/sidebar"
import { AppSidebar } from "./app-sidebar"

export const MainSidebarContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="relative flex min-h-0 flex-1 bg-background">
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">{children}</SidebarInset>
    </div>
  )
}
