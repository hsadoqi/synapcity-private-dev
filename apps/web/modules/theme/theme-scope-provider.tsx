"use client"

import * as React from "react"

import { buildThemeVariables } from "./theme-engine"
import { type ThemeRecord } from "./types"

interface ThemeScopeProviderProps {
  scopeType?: string
  scopeId?: string
  theme?: ThemeRecord | null
  children: React.ReactNode
  className?: string
}

export function ThemeScopeProvider({
  scopeType = "root",
  scopeId = "app",
  theme,
  children,
  className,
}: ThemeScopeProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const target = containerRef.current ?? document.documentElement

    if (theme) {
      const cssVars = buildThemeVariables(theme.primaryOklch, theme.accentOklch)
      Object.entries(cssVars).forEach(([name, value]) => {
        target.style.setProperty(name, value)
      })
    }
  }, [theme])

  const isExplicitTheme = Boolean(theme)

  return (
    <div
      ref={containerRef}
      className={className}
      data-theme-scope={scopeType}
      data-theme-scope-id={scopeId}
      data-theme-source={isExplicitTheme ? "explicit" : "inherited"}
      data-theme-id={isExplicitTheme && theme ? theme.id : undefined}
    >
      {children}
    </div>
  )
}
