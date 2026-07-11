import AppShell from "./_components/app-shell/app-shell"
import AppProviders from "./app-providers"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders scope="root">
      <AppShell>            
        {children}
      </AppShell>
    </AppProviders>
  )
}
