import { DEFAULT_THEME_RECORD, THEME_STORAGE_KEYS } from "../constants"
import { DEFAULT_THEME_FONTS, isThemeFontId } from "../font-registry"
import type { ThemeAssignment, ThemeRecord, ThemeScope } from "../types"

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  )
}

function normalizeNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function normalizeThemeRecord(theme: ThemeRecord): ThemeRecord {
  const bodyFont = isThemeFontId(theme.fonts?.body)
    ? theme.fonts.body
    : DEFAULT_THEME_FONTS.body
  const headingFont = isThemeFontId(theme.fonts?.heading)
    ? theme.fonts.heading
    : DEFAULT_THEME_FONTS.heading

  return {
    ...theme,
    radius: {
      ...theme.radius,
      base: normalizeNumber(
        theme.radius?.base,
        DEFAULT_THEME_RECORD.radius?.base ?? 0.75
      ),
    },
    typography: {
      ...theme.typography,
      scale: normalizeNumber(
        theme.typography?.scale,
        DEFAULT_THEME_RECORD.typography?.scale ?? 1
      ),
    },
    fonts: {
      body: bodyFont,
      heading: headingFont,
    },
  }
}

export function loadThemes(): ThemeRecord[] {
  if (!canUseStorage()) return [DEFAULT_THEME_RECORD]

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEYS.themes)
    if (!raw) return [DEFAULT_THEME_RECORD]
    const parsed = JSON.parse(raw) as ThemeRecord[]
    if (!Array.isArray(parsed)) return [DEFAULT_THEME_RECORD]

    const themes = parsed.map((theme) => normalizeThemeRecord(theme))
    const hasDefault = themes.some(
      (theme) => theme.id === DEFAULT_THEME_RECORD.id
    )
    return hasDefault ? themes : [DEFAULT_THEME_RECORD, ...themes]
  } catch {
    return [DEFAULT_THEME_RECORD]
  }
}

export function persistThemes(themes: ThemeRecord[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(THEME_STORAGE_KEYS.themes, JSON.stringify(themes))
}

export function saveTheme(theme: ThemeRecord): ThemeRecord[] {
  const nextTheme = normalizeThemeRecord(theme)
  const themes = loadThemes()
  const exists = themes.some((item) => item.id === nextTheme.id)
  const next = exists
    ? themes.map((item) => (item.id === nextTheme.id ? nextTheme : item))
    : [...themes, nextTheme]

  persistThemes(next)
  return next
}

export function deleteTheme(themeId: string): ThemeRecord[] {
  const next = loadThemes().filter((theme) => theme.id !== themeId)
  persistThemes(next)
  return next
}

export function loadThemeAssignments(): ThemeAssignment[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEYS.assignments)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ThemeAssignment[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function persistThemeAssignments(assignments: ThemeAssignment[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(
    THEME_STORAGE_KEYS.assignments,
    JSON.stringify(assignments)
  )
}

export function setThemeAssignment(input: {
  scope: ThemeScope
  scopeId: string
  themeId: string
}): ThemeAssignment[] {
  const assignments = loadThemeAssignments()
  const nextAssignment: ThemeAssignment = {
    ...input,
    updatedAt: new Date().toISOString(),
  }

  const next = [
    ...assignments.filter(
      (assignment) =>
        assignment.scope !== input.scope || assignment.scopeId !== input.scopeId
    ),
    nextAssignment,
  ]

  persistThemeAssignments(next)
  return next
}

export function removeThemeAssignment(input: {
  scope: ThemeScope
  scopeId: string
}): ThemeAssignment[] {
  const next = loadThemeAssignments().filter(
    (assignment) =>
      assignment.scope !== input.scope || assignment.scopeId !== input.scopeId
  )

  persistThemeAssignments(next)
  return next
}
