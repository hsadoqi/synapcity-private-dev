"use client"

import { ThemeScopeProvider, DEFAULT_THEME_RECORD } from "@/modules/theme"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeScopeProvider
      scopeType="root"
      scopeId="app"
      theme={DEFAULT_THEME_RECORD}
      className="min-h-svh bg-background text-foreground"
    >
      {children}
    </ThemeScopeProvider>
  )
}
