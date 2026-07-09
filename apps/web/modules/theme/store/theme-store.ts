"use client"

import * as React from "react"

import { DEFAULT_THEME_RECORD } from "../constants"
import {
  deleteTheme as deleteStoredTheme,
  loadThemeAssignments,
  loadThemes,
  persistThemeAssignments,
  saveTheme as saveStoredTheme,
  setThemeAssignment as setStoredThemeAssignment,
  removeThemeAssignment as removeStoredThemeAssignment,
} from "../storage/theme-storage"
import type { ThemeAssignment, ThemeRecord, ThemeScope } from "../types"

type ThemeState = {
  themes: ThemeRecord[]
  assignments: ThemeAssignment[]
  activeThemeId: string
}

type ThemeAssignmentInput = {
  scope: ThemeScope
  scopeId: string
  themeId: string
}

type ThemeAssignmentRemovalInput = {
  scope: ThemeScope
  scopeId: string
}

type ThemeSnapshot = ThemeState

const DEFAULT_THEME_STATE: ThemeState = {
  themes: [DEFAULT_THEME_RECORD],
  assignments: [],
  activeThemeId: DEFAULT_THEME_RECORD.id,
}

function createThemeStore(initialState: ThemeState = DEFAULT_THEME_STATE) {
  let state: ThemeState = initialState
  let snapshot: ThemeSnapshot = state
  let hydrated = false

  const listeners = new Set<() => void>()

  const emit = () => {
    snapshot = state
    listeners.forEach((listener) => listener())
  }

  const ensureHydrated = () => {
    if (hydrated || typeof window === "undefined") return

    const themes = loadThemes()
    const assignments = loadThemeAssignments()
    const hasActiveTheme = themes.some((theme) => theme.id === state.activeThemeId)

    state = {
      themes,
      assignments,
      activeThemeId: hasActiveTheme ? state.activeThemeId : DEFAULT_THEME_RECORD.id,
    }
    snapshot = state
    hydrated = true
  }

  return {
    subscribe(listener: () => void) {
      ensureHydrated()
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot() {
      ensureHydrated()
      return snapshot
    },

    getServerSnapshot() {
      return DEFAULT_THEME_STATE
    },

    setState(nextState: ThemeState | ((current: ThemeState) => ThemeState)) {
      ensureHydrated()
      state =
        typeof nextState === "function"
          ? (nextState as (current: ThemeState) => ThemeState)(state)
          : nextState

      emit()
    },

    getState() {
      ensureHydrated()
      return state
    },

    saveTheme(theme: ThemeRecord) {
      ensureHydrated()
      const themes = saveStoredTheme(theme)
      state = {
        ...state,
        themes,
        activeThemeId: theme.id,
      }
      emit()
    },

    deleteTheme(themeId: string) {
      ensureHydrated()
      const themes = deleteStoredTheme(themeId)
      const assignments = state.assignments.filter(
        (assignment) => assignment.themeId !== themeId,
      )

      persistThemeAssignments(assignments)

      state = {
        ...state,
        themes,
        assignments,
        activeThemeId:
          state.activeThemeId === themeId
            ? DEFAULT_THEME_RECORD.id
            : state.activeThemeId,
      }
      emit()
    },

    setAssignment(input: ThemeAssignmentInput) {
      ensureHydrated()
      const assignments = setStoredThemeAssignment(input)
      state = {
        ...state,
        assignments,
      }
      emit()
    },

    removeAssignment(input: ThemeAssignmentRemovalInput) {
      ensureHydrated()
      const assignments = removeStoredThemeAssignment(input)
      state = {
        ...state,
        assignments,
      }
      emit()
    },
  }
}

export const themeStore = createThemeStore()

export function useThemeSnapshot() {
  return React.useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  )
}
