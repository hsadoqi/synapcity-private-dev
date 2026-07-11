import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { buildThemeVars } from "../engine/build-theme-vars"
import { themeStore } from "../store/theme-store"
import type { ThemeAssignment, ThemeRecord } from "../types"
import { ThemeRootProvider } from "./theme-root-provider"
import { ThemeScopeProvider } from "./theme-scope-provider"

const theme: ThemeRecord = {
  id: "theme-provider",
  name: "Provider",
  version: 1,
  seeds: {
    primary: "oklch(0.58 0.12 72)",
    accent: "oklch(0.64 0.16 245)",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

function assignment(themeId = theme.id): ThemeAssignment {
  return {
    scope: "document",
    scopeId: "doc-one",
    themeId,
    updatedAt: "2026-01-01T00:00:00.000Z",
  }
}

describe("theme providers", () => {
  it("writes no generated styles for an unassigned scope", () => {
    themeStore.setState({ themes: [theme], assignments: [] })

    render(
      <ThemeScopeProvider scope="document" scopeId="doc-one">
        <span>content</span>
      </ThemeScopeProvider>
    )

    const boundary = screen.getByText("content").parentElement
    expect(boundary).toHaveAttribute("data-theme-resolution", "unassigned")
    expect(boundary).not.toHaveAttribute("style")
    expect(boundary).not.toHaveAttribute("data-theme-id")
  })

  it("writes no fallback styles for a missing assigned theme", () => {
    themeStore.setState({
      themes: [theme],
      assignments: [assignment("missing-theme")],
    })

    render(
      <ThemeScopeProvider scope="document" scopeId="doc-one">
        <span>content</span>
      </ThemeScopeProvider>
    )

    const boundary = screen.getByText("content").parentElement
    expect(boundary).toHaveAttribute("data-theme-resolution", "missing-theme")
    expect(boundary).not.toHaveAttribute("style")
    expect(boundary).not.toHaveAttribute("data-theme-id")
  })

  it("clears stale root variables and identity after removing assignment", async () => {
    const rootAssignment: ThemeAssignment = {
      ...assignment(),
      scope: "global",
      scopeId: "root",
    }
    themeStore.setState({ themes: [theme], assignments: [rootAssignment] })

    render(
      <ThemeRootProvider>
        <span>app</span>
      </ThemeRootProvider>
    )

    const expected = buildThemeVars(theme)["--primary-500"]
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue("--primary-500")).toBe(
        expected
      )
    )
    expect(document.documentElement).toHaveAttribute("data-theme-id", theme.id)

    themeStore.setState({ themes: [theme], assignments: [] })

    await waitFor(() =>
      expect(
        document.documentElement.style.getPropertyValue("--primary-500")
      ).toBe("")
    )
    expect(document.documentElement).not.toHaveAttribute("data-theme-id")
    expect(document.documentElement).toHaveAttribute(
      "data-theme-resolution",
      "unassigned"
    )
  })

  it("updates an assigned root through theme-ID reference semantics", async () => {
    const rootAssignment: ThemeAssignment = {
      ...assignment(),
      scope: "global",
      scopeId: "root",
    }
    themeStore.setState({ themes: [theme], assignments: [rootAssignment] })
    render(
      <ThemeRootProvider>
        <span>app</span>
      </ThemeRootProvider>
    )

    const appliedPrimary = buildThemeVars(theme)["--primary-500"]
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue("--primary-500")).toBe(
        appliedPrimary
      )
    )

    const updatedTheme: ThemeRecord = {
      ...theme,
      seeds: { ...theme.seeds, primary: "oklch(0.72 0.14 90)" },
    }
    themeStore.setState({
      themes: [updatedTheme],
      assignments: [rootAssignment],
    })

    const updatedPrimary = buildThemeVars(updatedTheme)["--primary-500"]
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue("--primary-500")).toBe(
        updatedPrimary
      )
    )
    expect(themeStore.getState().assignments).toEqual([rootAssignment])
  })
})
