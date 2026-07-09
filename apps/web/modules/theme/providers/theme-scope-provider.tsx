"use client"

import * as React from "react"

import { buildThemeVars, varsToReactStyle } from "../engine/build-theme-vars"
import { useResolvedTheme } from "../hooks/use-resolved-theme"
import type { ThemeScope } from "../types"

type ThemeScopeProviderProps = {
  scope: ThemeScope
  scopeId: string
  className?: string
  children: React.ReactNode
}

export function ThemeScopeProvider({
  scope,
  scopeId,
  className,
  children,
}: ThemeScopeProviderProps) {
  const resolution = useResolvedTheme(scope, scopeId)

  const style =
    resolution.status === "assigned"
      ? varsToReactStyle(buildThemeVars(resolution.theme))
      : undefined

  return (
    <div
      className={className}
      data-theme-scope={scope}
      data-theme-scope-id={scopeId}
      data-theme-id={
        resolution.status === "assigned" ? resolution.theme.id : undefined
      }
      data-theme-resolution={resolution.status}
      style={style}
    >
      {children}
    </div>
  )
}
