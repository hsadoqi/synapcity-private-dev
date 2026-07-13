"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

interface DocumentRulerProps {
  /** The real editor column width in CSS px (pre-zoom), matching the content's max-width. */
  columnWidthPx: number
  /** The real zoom multiplier (1 = 100%), so ticks and the column marker track what's on screen. */
  zoom: number
  className?: string
}

const MIN_TICK_SPACING_PX = 56
const TICK_STEP_CANDIDATES = [25, 50, 100, 200, 250, 500]

function pickStep(zoom: number): number {
  return (
    TICK_STEP_CANDIDATES.find((step) => step * zoom >= MIN_TICK_SPACING_PX) ??
    TICK_STEP_CANDIDATES[TICK_STEP_CANDIDATES.length - 1]!
  )
}

/**
 * A real measurement ruler over the editor canvas: it observes its own
 * rendered width and draws ticks to scale, and marks the actual column
 * boundary the content wraps at — not a static decorative pattern.
 */
export function DocumentRuler({ columnWidthPx, zoom, className }: DocumentRulerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const step = pickStep(zoom)
  const marks = React.useMemo(() => {
    if (containerWidth <= 0) return []
    const count = Math.ceil(containerWidth / (step * zoom)) + 1
    return Array.from({ length: count }, (_, index) => index * step)
  }, [containerWidth, step, zoom])

  const columnEdgePx = columnWidthPx * zoom

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "relative flex h-5.5 shrink-0 items-end overflow-hidden border-b border-border bg-background select-none",
        className
      )}
    >
      {marks.map((mark) => (
        <div
          key={mark}
          className="absolute bottom-0 flex flex-col items-start"
          style={{ left: `${mark * zoom}px` }}
        >
          <span className="mb-0.5 text-[9px] leading-none text-muted-foreground/40">
            {mark === 0 ? "" : mark}
          </span>
          <div className="h-1 w-px bg-muted-foreground/25" />
        </div>
      ))}
      {containerWidth > 0 && columnEdgePx <= containerWidth && (
        <div
          className="absolute top-0 bottom-0 w-px bg-primary/70"
          style={{ left: `${columnEdgePx}px` }}
          title={`Column ends at ${columnWidthPx}px`}
        />
      )}
    </div>
  )
}
