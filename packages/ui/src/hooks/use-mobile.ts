import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function getMobileSnapshot() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia(MOBILE_QUERY).matches
}

function subscribeMobileSnapshot(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", listener)
  return () => mql.removeEventListener("change", listener)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobileSnapshot,
    getMobileSnapshot,
    () => false
  )
}
