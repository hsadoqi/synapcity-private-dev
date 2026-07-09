"use client"

import { themeStore, useThemeSnapshot } from "../store/theme-store"
import type { ThemeRecord } from "../types"

export function useThemes() {
  const { themes } = useThemeSnapshot()

  return {
    themes,
    saveTheme: (theme: ThemeRecord) => themeStore.saveTheme(theme),
    deleteTheme: (themeId: string) => themeStore.deleteTheme(themeId),
  }
}
