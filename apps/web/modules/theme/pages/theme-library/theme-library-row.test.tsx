import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { ThemeRecord } from "../../types"
import { ThemeLibraryRow } from "./theme-library-row"

const THEME: ThemeRecord = {
  id: "theme-graphite",
  name: "Graphite",
  description: "Quiet neutral system",
  version: 1,
  seeds: {
    primary: "oklch(0.58 0.08 260)",
    accent: "oklch(0.72 0.12 84)",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
}

describe("ThemeLibraryRow", () => {
  it("opens the theme route from row activation and exposes separate actions", () => {
    const onOpen = vi.fn()
    const onDuplicate = vi.fn()

    render(
      <ThemeLibraryRow
        row={{
          theme: THEME,
          palette: {
            swatches: [
              { role: "primary", value: THEME.seeds.primary },
              { role: "accent", value: THEME.seeds.accent! },
            ],
            accessibleLabel:
              "Primary oklch(0.58 0.08 260), accent oklch(0.72 0.12 84)",
          },
          usage: { count: 2, label: "Root + 1 scope", isInUse: true },
          updatedLabel: "Jan 3, 2026",
        }}
        onDelete={vi.fn()}
        onDuplicate={onDuplicate}
        onOpen={onOpen}
        onRename={vi.fn()}
      />
    )

    const rowButton = screen.getByRole("button", { name: /open Graphite/i })
    rowButton.focus()
    expect(rowButton).toHaveFocus()
    fireEvent.keyDown(rowButton, { key: "Enter" })
    expect(onOpen).toHaveBeenCalledWith("theme-graphite")

    fireEvent.click(
      screen.getByRole("button", { name: /theme actions for Graphite/i })
    )

    expect(onDuplicate).not.toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledTimes(1)

    const palette = screen.getByLabelText(
      "Primary oklch(0.58 0.08 260), accent oklch(0.72 0.12 84)"
    )
    expect(within(palette).getAllByRole("presentation")).toHaveLength(2)
  })
})
