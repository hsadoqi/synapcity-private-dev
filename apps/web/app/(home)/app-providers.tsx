"use client"

import { ThemeScopeProvider } from "@/modules/theme"
import { SidebarProvider } from "@workspace/ui/components/primitives/sidebar"

export default function AppProviders({ children, scopeId, scope }: { children: React.ReactNode; scopeId?: string; scope: string; }) {
  return (
    <ThemeScopeProvider scopeType={scope} scopeId={scopeId}>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeScopeProvider>
  )
}
