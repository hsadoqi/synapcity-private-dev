"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

const MINIMUM_VISIBLE_MS = 180
const MAXIMUM_PENDING_MS = 10_000

export function NavigationFeedback() {
  const pathname = usePathname()
  const [pending, setPending] = React.useState(false)
  const startedAtRef = React.useRef(0)

  React.useEffect(() => {
    if (!pending) return

    const elapsed = performance.now() - startedAtRef.current
    const timeout = window.setTimeout(
      () => setPending(false),
      Math.max(0, MINIMUM_VISIBLE_MS - elapsed)
    )

    return () => window.clearTimeout(timeout)
  }, [pathname, pending])

  React.useEffect(() => {
    if (!pending) return

    const timeout = window.setTimeout(
      () => setPending(false),
      MAXIMUM_PENDING_MS
    )
    return () => window.clearTimeout(timeout)
  }, [pending])

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return
      }

      const destination = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      const isSameDocumentHashChange =
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash !== current.hash

      if (
        destination.origin !== current.origin ||
        destination.href === current.href ||
        isSameDocumentHashChange
      ) {
        return
      }

      startedAtRef.current = performance.now()
      setPending(true)
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  if (!pending) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/15"
    >
      <span className="sr-only">Loading page</span>
      <span className="block h-full w-1/2 animate-pulse bg-primary shadow-[0_0_12px_var(--primary)] motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  )
}
