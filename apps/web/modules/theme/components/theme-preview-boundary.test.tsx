import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DEFAULT_NEUTRAL_ACCENT } from "../constants"
import { generatePalette } from "../engine/generate-palette"
import type { ThemeRecord } from "../types"
import { themeStore } from "../store/theme-store"
import { ThemeScopeProvider } from "../providers/theme-scope-provider"
import { ThemePreviewBoundary } from "./theme-preview-boundary"

const draft: ThemeRecord = {
  id: "theme-preview",
  name: "Preview",
  version: 1,
  seeds: { primary: "oklch(0.58 0.12 72)" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("ThemePreviewBoundary", () => {
  it("contains draft variables and overrides surrounding accent fallback", () => {
    document.documentElement.style.setProperty(
      "--accent-500",
      "oklch(0.7 0.2 20)"
    )

    render(
      <ThemePreviewBoundary draft={draft}>
        <span>preview</span>
      </ThemePreviewBoundary>
    )

    const boundary = screen.getByText("preview").parentElement
    expect(boundary?.style.getPropertyValue("--primary-500")).not.toBe("")
    expect(boundary?.style.getPropertyValue("--accent-500")).toBe(
      generatePalette(DEFAULT_NEUTRAL_ACCENT)[500]
    )
    expect(document.documentElement.style.getPropertyValue("--accent-500")).toBe(
      "oklch(0.7 0.2 20)"
    )
  })

  it("updates only the preview when the draft changes", () => {
    const assignedTheme: ThemeRecord = {
      ...draft,
      id: "theme-assigned",
      seeds: {
        primary: "oklch(0.5 0.1 180)",
        accent: "oklch(0.64 0.16 245)",
      },
    }
    themeStore.setState({
      themes: [assignedTheme],
      assignments: [
        {
          scope: "document",
          scopeId: "doc-one",
          themeId: assignedTheme.id,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    })
    const rootPrimary = "oklch(0.4 0.1 20)"
    document.documentElement.style.setProperty("--primary-500", rootPrimary)

    const view = render(
      <ThemeScopeProvider scope="document" scopeId="doc-one">
        <span>real scope</span>
      </ThemeScopeProvider>
    )
    const realScope = screen.getByText("real scope").parentElement
    const realScopePrimary = realScope?.style.getPropertyValue("--primary-500")

    view.rerender(
      <>
        <ThemeScopeProvider scope="document" scopeId="doc-one">
          <span>real scope</span>
        </ThemeScopeProvider>
        <ThemePreviewBoundary
          draft={{
            ...draft,
            seeds: { primary: "oklch(0.72 0.14 90)" },
          }}
        >
          <span>preview edit</span>
        </ThemePreviewBoundary>
      </>
    )

    expect(
      screen
        .getByText("preview edit")
        .parentElement?.style.getPropertyValue("--primary-500")
    ).not.toBe(realScopePrimary)
    expect(document.documentElement.style.getPropertyValue("--primary-500")).toBe(
      rootPrimary
    )
    expect(
      screen
        .getByText("real scope")
        .parentElement?.style.getPropertyValue("--primary-500")
    ).toBe(realScopePrimary)
  })
})
