"use client"

import * as React from "react"

interface UseDocumentPreferenceOptions {
  documentId: string
  /** Unique per preference (e.g. "zoom", "column-width"). */
  key: string
  defaultValue: number
  min: number
  max: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function storageKeyFor(documentId: string, key: string) {
  return `synapcity.document.${documentId}.${key}`
}

function changeEventFor(key: string) {
  return `synapcity:document-preference-change:${key}`
}

/**
 * A per-document numeric preference (zoom, column width, …) persisted to
 * `localStorage` and shared reactively across every component reading the
 * same `(documentId, key)` pair.
 *
 * `localStorage` writes in the tab that made them don't fire the native
 * `storage` event (only other tabs see that), so same-tab subscribers need
 * a companion `window` event dispatched alongside every write.
 */
export function useDocumentPreference({
  documentId,
  key,
  defaultValue,
  min,
  max,
}: UseDocumentPreferenceOptions) {
  const storageKey = storageKeyFor(documentId, key)
  const changeEvent = changeEventFor(key)

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) onStoreChange()
      }
      window.addEventListener("storage", handleStorage)
      window.addEventListener(changeEvent, onStoreChange)
      return () => {
        window.removeEventListener("storage", handleStorage)
        window.removeEventListener(changeEvent, onStoreChange)
      }
    },
    [storageKey, changeEvent]
  )

  const getSnapshot = React.useCallback(() => {
    const stored = Number.parseInt(
      window.localStorage.getItem(storageKey) ?? "",
      10
    )
    return Number.isFinite(stored) ? clamp(stored, min, max) : defaultValue
  }, [storageKey, defaultValue, min, max])

  const getServerSnapshot = React.useCallback(
    () => defaultValue,
    [defaultValue]
  )

  const value = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setValue = React.useCallback(
    (next: number) => {
      window.localStorage.setItem(storageKey, String(clamp(next, min, max)))
      window.dispatchEvent(new Event(changeEvent))
    },
    [storageKey, changeEvent, min, max]
  )

  return [value, setValue] as const
}
