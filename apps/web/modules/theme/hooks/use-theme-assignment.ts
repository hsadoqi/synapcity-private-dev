"use client"

import { themeStore, useThemeSnapshot } from "../store/theme-store"
import type { ThemeScope } from "../types"

export function useThemeAssignment(scope: ThemeScope, scopeId: string) {
  const { assignments } = useThemeSnapshot()
  const assignment = assignments.find(
    (item) => item.scope === scope && item.scopeId === scopeId
  )

  return {
    assignment,
    setAssignment: (themeId: string) =>
      themeStore.setAssignment({ scope, scopeId, themeId }),
    removeAssignment: () => themeStore.removeAssignment({ scope, scopeId }),
  }
}
