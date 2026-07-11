"use client"

import * as React from "react"

const DESKTOP_WORKSPACE_QUERY = "(min-width: 1024px)"

function getDesktopWorkspaceSnapshot() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia(DESKTOP_WORKSPACE_QUERY).matches
}

function subscribeDesktopWorkspace(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const mediaQuery = window.matchMedia(DESKTOP_WORKSPACE_QUERY)
  mediaQuery.addEventListener("change", listener)

  return () => mediaQuery.removeEventListener("change", listener)
}

export function useIsDesktopWorkspace() {
  return React.useSyncExternalStore(
    subscribeDesktopWorkspace,
    getDesktopWorkspaceSnapshot,
    () => false
  )
}
