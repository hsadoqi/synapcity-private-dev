"use client"

import * as React from "react"

import { buildThemeVariables } from "./theme-engine"
import { useThemeSnapshot } from "./theme-store"
import {
  DEFAULT_THEME_RECORD,
  type ThemeAssignment,
  type ThemeRecord,
} from "./types"

function getRootTheme(themes: ThemeRecord[], assignments: ThemeAssignment[]) {
  const rootAssignment = assignments.find(
    (assignment) =>
      assignment.scopeType === "root" && assignment.scopeId === "app"
  )
  const assignedTheme = rootAssignment
    ? themes.find((theme) => theme.id === rootAssignment.themeId)
    : null

  return {
    theme: assignedTheme ?? themes[0] ?? DEFAULT_THEME_RECORD,
    isAssigned: Boolean(assignedTheme),
  }
}

function useDocumentRootTheme(theme: ThemeRecord, isAssigned: boolean) {
  React.useEffect(() => {
    const root = document.documentElement
    const vars = buildThemeVariables(theme.primaryOklch, theme.accentOklch)

    Object.entries(vars).forEach(([name, value]) => {
      root.style.setProperty(name, value)
    })

    root.dataset.themeScope = "root"
    root.dataset.themeScopeId = "app"
    root.dataset.themeSource = isAssigned ? "explicit" : "default"
    root.dataset.themeId = theme.id

    return () => {
      Object.keys(vars).forEach((name) => root.style.removeProperty(name))
      delete root.dataset.themeScope
      delete root.dataset.themeScopeId
      delete root.dataset.themeSource
      delete root.dataset.themeId
    }
  }, [isAssigned, theme.accentOklch, theme.id, theme.primaryOklch])
}

export function ThemeRootProvider({ children }: { children: React.ReactNode }) {
  const { themes, assignments } = useThemeSnapshot()
  const { theme, isAssigned } = getRootTheme(themes, assignments)

  useDocumentRootTheme(theme, isAssigned)

  return (
    <div className="min-h-svh bg-background text-foreground">{children}</div>
  )
}
