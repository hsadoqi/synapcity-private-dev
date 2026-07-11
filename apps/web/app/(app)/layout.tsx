import { AppShell } from "./_components/app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <main className="flex min-w-0 flex-1 flex-col px-6 py-8">{children}</main>
    </AppShell>
  )
}
