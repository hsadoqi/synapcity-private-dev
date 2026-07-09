import Link from "next/link"

import { ThemeScopeProvider } from "@/modules/theme"

const navigation = [
  { href: "/", label: "Home" },
  { href: "/documents", label: "Documents" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/settings/theme", label: "Theme" },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeScopeProvider className="min-h-svh bg-background text-foreground">
      <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_40%)]">
        <header className="border-b border-border/70 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Synapcity
              </p>
              <p className="text-sm text-muted-foreground">V0 architecture scaffold</p>
            </div>
            <nav className="flex gap-3 text-sm">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 hover:bg-muted">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6 py-8">{children}</main>
      </div>
    </ThemeScopeProvider>
  )
}
