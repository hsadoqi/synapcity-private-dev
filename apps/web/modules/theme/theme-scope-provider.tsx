"use client"

import * as React from "react"

import { buildThemeVariables } from "./theme-engine"
import { type ThemeRecord, type ThemeScopeType } from "./types"

interface ThemeScopeProviderProps {
  scopeType?: ThemeScopeType
  scopeId?: string
  theme?: ThemeRecord | null
  children: React.ReactNode
  className?: string
}

export function ThemeScopeProvider({
  scopeType = "root",
  scopeId = "app",
  theme = null,
  children,
  className,
}: ThemeScopeProviderProps) {
  const primaryOklch = theme?.primaryOklch
  const accentOklch = theme?.accentOklch
  const cssVars = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!primaryOklch || !accentOklch) {
      return undefined
    }

    return buildThemeVariables(
      primaryOklch,
      accentOklch
    ) as React.CSSProperties
  }, [accentOklch, primaryOklch])

  const isExplicitTheme = Boolean(theme)

  return (
    <div
      className={className}
      style={cssVars}
      data-theme-scope={scopeType}
      data-theme-scope-id={scopeId}
      data-theme-source={isExplicitTheme ? "explicit" : "inherited"}
      data-theme-id={isExplicitTheme && theme ? theme.id : undefined}
    >
      {children}
    </div>
  )
}
