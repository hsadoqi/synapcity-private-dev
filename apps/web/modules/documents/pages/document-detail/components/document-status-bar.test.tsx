import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  DocumentStatusBar,
  formatReadingTime,
  formatSavedLabel,
} from "./document-status-bar"

describe("DocumentStatusBar", () => {
  it("renders only the supplied document statistics", () => {
    render(<DocumentStatusBar words={1} characters={42} blockType="Heading 2" />)

    expect(screen.getByText("1 word")).toBeInTheDocument()
    expect(screen.getByText("42 characters")).toBeInTheDocument()
    expect(screen.getByText("Heading 2")).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("exposes controlled zoom actions without inventing zoom state", () => {
    const onDecrease = vi.fn()
    const onIncrease = vi.fn()
    const onReset = vi.fn()

    render(
      <DocumentStatusBar
        words={0}
        characters={0}
        zoom={{
          percent: 125,
          canDecrease: true,
          canIncrease: false,
          onDecrease,
          onIncrease,
          onReset,
        }}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom from 125%" }))

    expect(onDecrease).toHaveBeenCalledOnce()
    expect(onReset).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled()
    expect(onIncrease).not.toHaveBeenCalled()
  })

  it("exposes controlled column-width actions without inventing state", () => {
    const onDecrease = vi.fn()
    const onIncrease = vi.fn()

    render(
      <DocumentStatusBar
        words={0}
        characters={0}
        column={{
          widthPx: 720,
          canDecrease: true,
          canIncrease: true,
          onDecrease,
          onIncrease,
        }}
      />
    )

    expect(screen.getByText("Column 720px")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Widen column" }))
    expect(onIncrease).toHaveBeenCalledOnce()
    expect(onDecrease).not.toHaveBeenCalled()
  })

  it("toggles fullscreen via the supplied callback", () => {
    const onToggle = vi.fn()
    render(
      <DocumentStatusBar
        words={0}
        characters={0}
        fullscreen={{ isFullscreen: false, onToggle }}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Enter full screen" }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})

describe("formatReadingTime", () => {
  it("rounds to the nearest minute at 200wpm, minimum 1", () => {
    expect(formatReadingTime(0)).toBe("Reading time 1 min")
    expect(formatReadingTime(50)).toBe("Reading time 1 min")
    expect(formatReadingTime(1245)).toBe("Reading time 6 min")
  })

  it("honors a custom words-per-minute rate", () => {
    expect(formatReadingTime(400, 100)).toBe("Reading time 4 min")
  })
})

describe("formatSavedLabel", () => {
  it("prioritizes in-flight and error states over the timestamp", () => {
    expect(formatSavedLabel("saving", Date.now(), Date.now())).toBe("Saving…")
    expect(formatSavedLabel("error", Date.now(), Date.now())).toBe(
      "Couldn't save"
    )
    expect(formatSavedLabel("dirty", Date.now(), Date.now())).toBe(
      "Unsaved changes"
    )
  })

  it("reports never-saved distinctly from a stale timestamp", () => {
    expect(formatSavedLabel("clean", null, Date.now())).toBe("Not saved yet")
  })

  it("buckets elapsed time into just-now / minutes / hours / days", () => {
    const now = Date.parse("2026-07-13T12:00:00.000Z")
    expect(formatSavedLabel("saved", now - 10_000, now)).toBe("Saved just now")
    expect(formatSavedLabel("saved", now - 120_000, now)).toBe("Saved 2 min ago")
    expect(formatSavedLabel("saved", now - 2 * 3_600_000, now)).toBe(
      "Saved 2h ago"
    )
    expect(formatSavedLabel("saved", now - 3 * 86_400_000, now)).toBe(
      "Saved 3d ago"
    )
  })
})
