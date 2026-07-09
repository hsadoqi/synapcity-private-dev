import { AppProviders } from "./app-providers"
import { AppHeader } from "./app-header"

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProviders>
      <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_40%)]">
        <AppHeader />
        {children}
      </div>
    </AppProviders>
  )
}
