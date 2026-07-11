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
}

type ThemeStoreStorage = {
  loadThemes: () => ThemeRecord[]
  loadAssignments: () => ThemeAssignment[]
  saveTheme: (theme: ThemeRecord) => ThemeRecord[]
  deleteTheme: (themeId: string) => ThemeRecord[]
  persistAssignments: (assignments: ThemeAssignment[]) => void
  setAssignment: (input: ThemeAssignmentInput) => ThemeAssignment[]
  removeAssignment: (
    input: ThemeAssignmentRemovalInput
  ) => ThemeAssignment[]
}

const browserStorage: ThemeStoreStorage = {
  loadThemes,
  loadAssignments: loadThemeAssignments,
  saveTheme: saveStoredTheme,
  deleteTheme: deleteStoredTheme,
  persistAssignments: persistThemeAssignments,
  setAssignment: setStoredThemeAssignment,
  removeAssignment: removeStoredThemeAssignment,
}

export function createThemeStore(options?: {
  initialState?: ThemeState
  storage?: ThemeStoreStorage
}) {
  const storage = options?.storage ?? browserStorage
  let state: ThemeState = options?.initialState ?? DEFAULT_THEME_STATE
  let snapshot: ThemeSnapshot = state
  let hydrated = false

  const listeners = new Set<() => void>()

  const emit = () => {
    snapshot = state
    listeners.forEach((listener) => listener())
  }

  const ensureHydrated = () => {
    if (hydrated || typeof window === "undefined") return

    const themes = storage.loadThemes()
    const assignments = storage.loadAssignments()

    state = {
      themes,
      assignments,
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
      const themes = storage.saveTheme(theme)
      state = {
        ...state,
        themes,
      }
      emit()
    },

    deleteTheme(themeId: string) {
      ensureHydrated()
      const isAssigned = state.assignments.some(
        (assignment) => assignment.themeId === themeId
      )
      if (isAssigned) {
        throw new Error(`Theme is assigned: ${themeId}`)
      }

      const themes = storage.deleteTheme(themeId)

      state = {
        ...state,
        themes,
      }
      emit()
    },

    setAssignment(input: ThemeAssignmentInput) {
      ensureHydrated()
      if (!state.themes.some((theme) => theme.id === input.themeId)) {
        throw new Error(`Cannot assign missing theme: ${input.themeId}`)
      }

      const assignments = storage.setAssignment(input)
      state = {
        ...state,
        assignments,
      }
      emit()
    },

    removeAssignment(input: ThemeAssignmentRemovalInput) {
      ensureHydrated()
      const assignments = storage.removeAssignment(input)
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
    themeStore.getServerSnapshot
  )
}
