import {
  DEFAULT_THEME_RECORD,
  type ThemeAssignment,
  type ThemeRecord,
  type ThemeScopeType,
} from "../types"
import { normalizeOklch } from "../theme-engine"

const STORAGE_KEY = "synapcity.themes.v1"
const LEGACY_STORAGE_KEY = "synapcity.themes"
const ASSIGNMENT_STORAGE_KEY = "synapcity.theme-assignments.v1"
const LEGACY_ASSIGNMENT_STORAGE_KEY = "synapcity.theme-assignments"

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

function now() {
  return new Date().toISOString()
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const byId = new Map<string, T>()
  items.forEach((item) => byId.set(item.id, item))
  return Array.from(byId.values())
}

function normalizeThemeRecord(theme: ThemeRecord): ThemeRecord {
  const timestamp = now()

  return {
    ...theme,
    primaryOklch: normalizeOklch(theme.primaryOklch),
    accentOklch: normalizeOklch(theme.accentOklch),
    version: theme.version || 1,
    createdAt: theme.createdAt || timestamp,
    updatedAt: theme.updatedAt || timestamp,
  }
}

function readJsonArray<T>(key: string): T[] | null {
  if (!canUseStorage()) {
    return null
  }

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function readThemesFromStorage(): ThemeRecord[] {
  const saved =
    readJsonArray<ThemeRecord>(STORAGE_KEY) ??
    readJsonArray<ThemeRecord>(LEGACY_STORAGE_KEY) ??
    []

  return uniqueById([DEFAULT_THEME_RECORD, ...saved]).map(normalizeThemeRecord)
}

function readAssignmentsFromStorage(): ThemeAssignment[] {
  return (
    readJsonArray<ThemeAssignment>(ASSIGNMENT_STORAGE_KEY) ??
    readJsonArray<ThemeAssignment>(LEGACY_ASSIGNMENT_STORAGE_KEY) ??
    []
  )
}

function persistThemes(themes: ThemeRecord[]) {
  writeJson(
    STORAGE_KEY,
    uniqueById([DEFAULT_THEME_RECORD, ...themes]).map(normalizeThemeRecord)
  )
}

function persistAssignments(assignments: ThemeAssignment[]) {
  writeJson(ASSIGNMENT_STORAGE_KEY, assignments)
}

export function loadThemes(): ThemeRecord[] {
  return readThemesFromStorage()
}

export function loadThemeAssignments(): ThemeAssignment[] {
  return readAssignmentsFromStorage()
}

export function saveTheme(theme: ThemeRecord) {
  const cleanTheme = normalizeThemeRecord({ ...theme, updatedAt: now() })
  const themes = readThemesFromStorage()
  const nextThemes = themes.some((item) => item.id === cleanTheme.id)
    ? themes.map((item) => (item.id === cleanTheme.id ? cleanTheme : item))
    : [...themes, cleanTheme]

  persistThemes(nextThemes)
  if (canUseStorage()) {
    window.dispatchEvent(new CustomEvent("synapcity:theme-change"))
  }
  return nextThemes
}

export function setThemeAssignment(input: {
  scopeType: ThemeScopeType
  scopeId: string
  themeId: string
}) {
  const timestamp = now()
  const assignments = readAssignmentsFromStorage()
  const id = `${input.scopeType}:${input.scopeId}`
  const nextAssignment: ThemeAssignment = {
    id,
    scopeType: input.scopeType,
    scopeId: input.scopeId,
    themeId: input.themeId,
    createdAt:
      assignments.find((item) => item.id === id)?.createdAt ?? timestamp,
    updatedAt: timestamp,
  }

  const nextAssignments = assignments.some((item) => item.id === id)
    ? assignments.map((item) => (item.id === id ? nextAssignment : item))
    : [...assignments, nextAssignment]

  persistAssignments(nextAssignments)
  if (canUseStorage()) {
    window.dispatchEvent(new CustomEvent("synapcity:theme-change"))
  }
  return nextAssignments
}

export function saveThemeAssignment(assignment: ThemeAssignment) {
  return setThemeAssignment({
    scopeType: assignment.scopeType,
    scopeId: assignment.scopeId,
    themeId: assignment.themeId,
  })
}

export function removeThemeAssignment(
  scopeType: ThemeScopeType,
  scopeId: string
) {
  const id = `${scopeType}:${scopeId}`
  const nextAssignments = readAssignmentsFromStorage().filter(
    (assignment) => assignment.id !== id
  )

  persistAssignments(nextAssignments)
  if (canUseStorage()) {
    window.dispatchEvent(new CustomEvent("synapcity:theme-change"))
  }
  return nextAssignments
}

export function getAssignedTheme(
  scopeType: ThemeScopeType,
  scopeId: string
): ThemeRecord | null {
  const assignments = readAssignmentsFromStorage()
  const assignment = assignments.find(
    (item) => item.scopeType === scopeType && item.scopeId === scopeId
  )

  if (!assignment) {
    return null
  }

  return (
    readThemesFromStorage().find((theme) => theme.id === assignment.themeId) ??
    null
  )
}
