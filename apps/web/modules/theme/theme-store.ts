"use client"

import * as React from "react"

import {
  loadThemeAssignments,
  loadThemes,
  removeThemeAssignment,
  saveTheme,
  setThemeAssignment,
} from "./services/theme-data"
import {
  DEFAULT_THEME_RECORD,
  type ThemeAssignment,
  type ThemeRecord,
  type ThemeScopeType,
} from "./types"
import { normalizeOklch } from "./theme-engine"

const THEME_CHANGE_EVENT = "synapcity:theme-change"

export interface ThemeSnapshot {
  themes: ThemeRecord[]
  assignments: ThemeAssignment[]
}

export interface ThemeDraft {
  name: string
  primaryOklch: string
  accentOklch: string
  mode?: ThemeRecord["mode"]
}

export interface ThemeAssignmentInput {
  scopeType: ThemeScopeType
  scopeId: string
  themeId: string
}

const SERVER_SNAPSHOT: ThemeSnapshot = {
  themes: [DEFAULT_THEME_RECORD],
  assignments: [],
}

let snapshot = readSnapshot()
const listeners = new Set<() => void>()
let hasBrowserListeners = false

function canUseBrowserEvents() {
  return typeof window !== "undefined"
}

function now() {
  return new Date().toISOString()
}

function createThemeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `theme-${crypto.randomUUID()}`
  }

  return `theme-${Date.now()}`
}

function readSnapshot(): ThemeSnapshot {
  return {
    themes: loadThemes(),
    assignments: loadThemeAssignments(),
  }
}

function getThemeFromSnapshot(themeId: string) {
  return (
    snapshot.themes.find((theme) => theme.id === themeId) ??
    snapshot.themes[0] ??
    DEFAULT_THEME_RECORD
  )
}

function emitSnapshotChange() {
  snapshot = readSnapshot()
  listeners.forEach((listener) => listener())
}

function setSnapshot(nextSnapshot: ThemeSnapshot) {
  snapshot = nextSnapshot
  listeners.forEach((listener) => listener())
}

function ensureBrowserListeners() {
  if (!canUseBrowserEvents() || hasBrowserListeners) {
    return
  }

  window.addEventListener("storage", emitSnapshotChange)
  window.addEventListener(THEME_CHANGE_EVENT, emitSnapshotChange)
  hasBrowserListeners = true
}

function subscribe(listener: () => void) {
  ensureBrowserListeners()
  listeners.add(listener)
  emitSnapshotChange()

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function useThemeSnapshot() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function createTheme(input: ThemeDraft) {
  const timestamp = now()
  const theme: ThemeRecord = {
    id: createThemeId(),
    name: input.name.trim(),
    primaryOklch: normalizeOklch(input.primaryOklch),
    accentOklch: normalizeOklch(input.accentOklch),
    mode: input.mode ?? "system",
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const themes = saveTheme(theme)
  setSnapshot({ ...snapshot, themes })
  return theme
}

export function updateTheme(theme: ThemeRecord, input: ThemeDraft) {
  const nextTheme: ThemeRecord = {
    ...theme,
    name: input.name.trim(),
    primaryOklch: normalizeOklch(input.primaryOklch),
    accentOklch: normalizeOklch(input.accentOklch),
    mode: input.mode ?? theme.mode,
    updatedAt: now(),
  }

  const themes = saveTheme(nextTheme)
  setSnapshot({ ...snapshot, themes })
  return nextTheme
}

export function assignTheme(input: ThemeAssignmentInput) {
  const assignments = setThemeAssignment(input)
  setSnapshot({ ...snapshot, assignments })
}

export function removeAssignment(scopeType: ThemeScopeType, scopeId: string) {
  const assignments = removeThemeAssignment(scopeType, scopeId)
  setSnapshot({ ...snapshot, assignments })
}

export function refreshThemeStore() {
  emitSnapshotChange()
}

export function getThemeById(themeId: string) {
  return getThemeFromSnapshot(themeId)
}

export function getAssignedThemeFromStore(
  scopeType: ThemeScopeType,
  scopeId: string
) {
  const assignment = snapshot.assignments.find(
    (item) => item.scopeType === scopeType && item.scopeId === scopeId
  )

  if (!assignment) {
    return null
  }

  return getThemeFromSnapshot(assignment.themeId)
}

export function getRootThemeFromStore() {
  return (
    getAssignedThemeFromStore("root", "app") ??
    snapshot.themes[0] ??
    DEFAULT_THEME_RECORD
  )
}
