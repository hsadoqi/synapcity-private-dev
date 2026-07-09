import {
  DEFAULT_THEME_RECORD,
  type ThemeAssignment,
  type ThemeRecord,
} from "../types"

const STORAGE_KEY = "synapcity.themes"
const ASSIGNMENT_STORAGE_KEY = "synapcity.theme-assignments"

function readThemesFromStorage(): ThemeRecord[] {
  if (typeof window === "undefined") {
    return [DEFAULT_THEME_RECORD]
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return [DEFAULT_THEME_RECORD]
  }

  try {
    const parsed = JSON.parse(rawValue) as ThemeRecord[]
    return Array.isArray(parsed) ? parsed : [DEFAULT_THEME_RECORD]
  } catch {
    return [DEFAULT_THEME_RECORD]
  }
}

function readAssignmentsFromStorage(): ThemeAssignment[] {
  if (typeof window === "undefined") {
    return []
  }

  const rawValue = window.localStorage.getItem(ASSIGNMENT_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as ThemeAssignment[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistThemes(themes: ThemeRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
}

function persistAssignments(assignments: ThemeAssignment[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    ASSIGNMENT_STORAGE_KEY,
    JSON.stringify(assignments)
  )
}

export function loadThemes(): ThemeRecord[] {
  return readThemesFromStorage()
}

export function loadThemeAssignments(): ThemeAssignment[] {
  return readAssignmentsFromStorage()
}

export function saveTheme(theme: ThemeRecord) {
  const themes = readThemesFromStorage()
  const nextThemes = themes.some((item) => item.id === theme.id)
    ? themes.map((item) => (item.id === theme.id ? theme : item))
    : [...themes, theme]

  persistThemes(nextThemes)
  return nextThemes
}

export function saveThemeAssignment(assignment: ThemeAssignment) {
  const assignments = readAssignmentsFromStorage()
  const nextAssignments = assignments.some((item) => item.id === assignment.id)
    ? assignments.map((item) => (item.id === assignment.id ? assignment : item))
    : [...assignments, assignment]

  persistAssignments(nextAssignments)
  return nextAssignments
}
