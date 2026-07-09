"use client"

import { ThemeRootProvider } from "@/modules/theme"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeRootProvider>{children}</ThemeRootProvider>
}
