"use client"

import { ThemeScopeProvider } from "@/modules/theme"
import { SidebarProvider } from "@workspace/ui/components/primitives/sidebar"

export default function AppProviders({ children, scopeId, scope }: { children: React.ReactNode; scopeId?: string; scope: string; }) {
  return (
    <ThemeScopeProvider scopeType={scope} scopeId={scopeId}>
      <SidebarProvider className="min-h-[calc(100svh-64px)]">
        {children}
      </SidebarProvider>
    </ThemeScopeProvider>
  )
}
