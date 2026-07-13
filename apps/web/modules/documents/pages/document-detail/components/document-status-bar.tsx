import * as React from "react"
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import type { DocumentSaveState } from "./document-status"

interface DocumentZoomControls {
  percent: number
  canDecrease: boolean
  canIncrease: boolean
  onDecrease: () => void
  onIncrease: () => void
  onReset: () => void
}

interface DocumentColumnControls {
  widthPx: number
  canDecrease: boolean
  canIncrease: boolean
  onDecrease: () => void
  onIncrease: () => void
}

interface DocumentSavedIndicator {
  state: DocumentSaveState
  /** `Date.now()`-style epoch ms of the last successful save, or null if never saved this session. */
  lastSavedAt: number | null
  /** Injectable for tests; defaults to `Date.now`. */
  now?: () => number
}

interface DocumentFullscreenControls {
  isFullscreen: boolean
  onToggle: () => void
}

interface DocumentStatusBarProps {
  words: number
  characters: number
  blockType?: string
  /** Words-per-minute assumption for the reading-time estimate. Defaults to 200. */
  readingWordsPerMinute?: number
  saved?: DocumentSavedIndicator
  zoom?: DocumentZoomControls
  column?: DocumentColumnControls
  fullscreen?: DocumentFullscreenControls
  className?: string
}

const numberFormatter = new Intl.NumberFormat()
const SAVED_LABEL_REFRESH_MS = 15_000

function formatCount(value: number, unit: "word" | "character") {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
  return `${numberFormatter.format(safeValue)} ${unit}${safeValue === 1 ? "" : "s"}`
}

/** Pure so it's testable without mounting the component or faking timers. */
export function formatReadingTime(words: number, wordsPerMinute = 200): string {
  const minutes = Math.max(1, Math.round(words / wordsPerMinute))
  return `Reading time ${minutes} min`
}

/** Pure so the relative-time logic is testable independent of React/timers. */
export function formatSavedLabel(
  state: DocumentSaveState,
  lastSavedAt: number | null,
  nowMs: number
): string {
  if (state === "saving") return "Saving…"
  if (state === "error") return "Couldn't save"
  if (state === "dirty") return "Unsaved changes"
  if (lastSavedAt === null) return "Not saved yet"

  const elapsedMs = Math.max(0, nowMs - lastSavedAt)
  if (elapsedMs < 30_000) return "Saved just now"

  const minutes = Math.round(elapsedMs / 60_000)
  if (minutes < 60) return `Saved ${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Saved ${hours}h ago`

  const days = Math.round(hours / 24)
  return `Saved ${days}d ago`
}

function useNow(enabled: boolean) {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(
      () => setNow(Date.now()),
      SAVED_LABEL_REFRESH_MS
    )
    return () => window.clearInterval(interval)
  }, [enabled])

  return now
}

export function DocumentStatusBar({
  words,
  characters,
  blockType,
  readingWordsPerMinute = 200,
  saved,
  zoom,
  column,
  fullscreen,
  className,
}: DocumentStatusBarProps) {
  // The "Saved Xm ago" label goes stale as time passes even with no new
  // saves, so it needs its own clock — polling `saved.now` on an interval
  // is cheaper and more testable than a setTimeout chain.
  const liveNow = useNow(Boolean(saved))
  const nowFn = saved?.now ?? (() => liveNow)

  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center gap-4 border-t border-border bg-background px-4 text-[11px] text-muted-foreground select-none",
        className
      )}
      aria-label="Document statistics"
    >
      <span>{formatCount(words, "word")}</span>
      <span>{formatReadingTime(words, readingWordsPerMinute)}</span>
      {blockType && <span>{blockType}</span>}
      {saved && (
        <span
          className="flex items-center gap-1.5"
          role="status"
          aria-live="polite"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          {formatSavedLabel(saved.state, saved.lastSavedAt, nowFn())}
        </span>
      )}
      <div className="flex-1" />
      {characters > 0 && (
        <span className="hidden sm:inline">{formatCount(characters, "character")}</span>
      )}
      {column && (
        <div
          className="flex items-center gap-1"
          aria-label="Editor column width controls"
        >
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            aria-label="Narrow column"
            disabled={!column.canDecrease}
            onClick={column.onDecrease}
          >
            <Minus className="size-3" aria-hidden="true" />
          </button>
          <span className="min-w-16 text-center">Column {column.widthPx}px</span>
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            aria-label="Widen column"
            disabled={!column.canIncrease}
            onClick={column.onIncrease}
          >
            <Plus className="size-3" aria-hidden="true" />
          </button>
        </div>
      )}
      {zoom && (
        <div className="flex items-center gap-1" aria-label="Editor zoom controls">
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            aria-label="Zoom out"
            disabled={!zoom.canDecrease}
            onClick={zoom.onDecrease}
          >
            <Minus className="size-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="min-w-9 rounded px-1 py-0.5 text-center transition-colors hover:bg-secondary"
            aria-label={`Reset zoom from ${zoom.percent}%`}
            title="Reset zoom"
            onClick={zoom.onReset}
          >
            {zoom.percent}%
          </button>
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            aria-label="Zoom in"
            disabled={!zoom.canIncrease}
            onClick={zoom.onIncrease}
          >
            <Plus className="size-3" aria-hidden="true" />
          </button>
        </div>
      )}
      {fullscreen && (
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded transition-colors hover:bg-secondary"
          aria-label={fullscreen.isFullscreen ? "Exit full screen" : "Enter full screen"}
          onClick={fullscreen.onToggle}
        >
          {fullscreen.isFullscreen ? (
            <Minimize2 className="size-3" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-3" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  )
}
