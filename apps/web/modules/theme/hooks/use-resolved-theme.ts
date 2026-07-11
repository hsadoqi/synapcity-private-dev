"use client"

import { resolveThemeAssignment } from "../resolution/resolve-theme-assignment"
import { useThemeSnapshot } from "../store/theme-store"
import type { ThemeResolution, ThemeScope } from "../types"

export function useResolvedTheme(
  scope: ThemeScope,
  scopeId: string
): ThemeResolution {
  const snapshot = useThemeSnapshot()

  return resolveThemeAssignment({
    themes: snapshot.themes,
    assignments: snapshot.assignments,
    scope,
    scopeId,
  })
}
