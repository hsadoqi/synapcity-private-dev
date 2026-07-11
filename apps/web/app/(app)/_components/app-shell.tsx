import { AppProviders } from "./app-providers"
import { AppHeader } from "./app-header"
import { MainSidebarContainer } from "./main-sidebar-container"
import { AppContextToolbarBridge } from "./app-toolbar-bridge"

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProviders>
      <div className="flex min-h-dvh w-full flex-col">
        <AppHeader />
        <AppContextToolbarBridge />
        <MainSidebarContainer>{children}</MainSidebarContainer>
      </div>
    </AppProviders>
  )
}
