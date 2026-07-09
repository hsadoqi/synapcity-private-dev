"use client"

import * as React from "react"

import { buildThemeVars } from "../engine/build-theme-vars"
import { useResolvedTheme } from "../hooks/use-resolved-theme"
import { ThemeProvider as NextThemesProvider } from "next-themes"

const ROOT_THEME_SCOPE = "global"
const ROOT_THEME_SCOPE_ID = "root"

type ThemeRootProviderProps = {
  children: React.ReactNode
}

export function ThemeModeProvider({ children }: ThemeRootProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}

export function ThemeRootProvider({ children }: ThemeRootProviderProps) {
  const resolution = useResolvedTheme(ROOT_THEME_SCOPE, ROOT_THEME_SCOPE_ID)
  const theme = resolution.theme

  React.useEffect(() => {
    const root = document.documentElement
    const vars = buildThemeVars(theme)

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }

    root.dataset.themeScope = ROOT_THEME_SCOPE
    root.dataset.themeScopeId = ROOT_THEME_SCOPE_ID
    root.dataset.themeId = theme.id
    root.dataset.themeResolution = resolution.status
  }, [theme, resolution.status])

  return <ThemeModeProvider>{children}</ThemeModeProvider>
}
