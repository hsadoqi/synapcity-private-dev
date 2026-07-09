"use client"

import { DEFAULT_THEME_RECORD } from "../constants"
import { useThemeSnapshot } from "../store/theme-store"
import type { ThemeRecord, ThemeScope } from "../types"

type ThemeResolution =
  | {
    status: "assigned"
    theme: ThemeRecord
  }
  | {
    status: "inherited"
    theme: ThemeRecord
  }

export function useResolvedTheme(
  scope?: ThemeScope,
  scopeId?: string,
): ThemeResolution {
  const snapshot = useThemeSnapshot()

  const themes = snapshot.themes.length > 0 ? snapshot.themes : [DEFAULT_THEME_RECORD]

  const fallbackTheme =
    themes.find((theme) => theme.id === DEFAULT_THEME_RECORD.id) ??
    DEFAULT_THEME_RECORD

  if (!scope || !scopeId) {
    return {
      status: "assigned",
      theme: fallbackTheme,
    }
  }

  const assignment = snapshot.assignments.find(
    (assignment) =>
      assignment.scope === scope && assignment.scopeId === scopeId,
  )

  if (!assignment) {
    return {
      status: "inherited",
      theme: fallbackTheme,
    }
  }

  const assignedTheme =
    themes.find((theme) => theme.id === assignment.themeId) ?? fallbackTheme

  return {
    status: "assigned",
    theme: assignedTheme,
  }
}