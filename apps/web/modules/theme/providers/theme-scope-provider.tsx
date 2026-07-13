"use client"

import * as React from "react"

import { buildThemeVariables } from "../theme-engine"
import { type ThemeRecord } from "../types"
import { cn } from "@workspace/ui/lib/utils"

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
  const isExplicitTheme = Boolean(theme)
  const style = theme
    ? (buildThemeVariables(
        theme.primaryOklch,
        theme.accentOklch
      ) as React.CSSProperties)
    : undefined

  return (
    <div
      style={style}
      className={cn("flex flex-1", className)}
      data-theme-scope={scopeType}
      data-theme-scope-id={scopeId}
      data-theme-source={isExplicitTheme ? "explicit" : "inherited"}
      data-theme-id={isExplicitTheme && theme ? theme.id : undefined}
    >
      {children}
    </div>
  )
}
