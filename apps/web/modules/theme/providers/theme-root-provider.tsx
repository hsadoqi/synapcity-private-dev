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
  const appliedKeysRef = React.useRef<string[]>([])

  React.useEffect(() => {
    const root = document.documentElement

    for (const key of appliedKeysRef.current) {
      root.style.removeProperty(key)
    }
    appliedKeysRef.current = []

    root.dataset.themeScope = ROOT_THEME_SCOPE
    root.dataset.themeScopeId = ROOT_THEME_SCOPE_ID
    root.dataset.themeResolution = resolution.status

    if (resolution.status === "assigned") {
      const vars = buildThemeVars(resolution.theme)
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value)
      }
      appliedKeysRef.current = Object.keys(vars)
      root.dataset.themeId = resolution.theme.id
    } else {
      delete root.dataset.themeId
    }

    return () => {
      for (const key of appliedKeysRef.current) {
        root.style.removeProperty(key)
      }
      appliedKeysRef.current = []
    }
  }, [resolution])

  return <ThemeModeProvider>{children}</ThemeModeProvider>
}
