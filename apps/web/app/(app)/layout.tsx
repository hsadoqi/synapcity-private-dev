import { AppShell } from "./components/app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6 py-8">
        {children}
      </main>
    </AppShell>
  )
}
