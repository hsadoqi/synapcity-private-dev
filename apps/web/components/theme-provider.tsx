"use client"

import { ClientThemeProvider } from "@wrksz/themes/client"
import type { ComponentProps } from "react"

// Standard next-themes wrapper (shadcn convention). This is a light/dark
// mode provider — unrelated to modules/theme, which manages Synapcity's
// design-token theme records (palettes, OKLCH assignments). Two different
// "theme" concepts sharing a name; keep them separate.
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof ClientThemeProvider>) {
  return (
    <ClientThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ClientThemeProvider>
  )
}
