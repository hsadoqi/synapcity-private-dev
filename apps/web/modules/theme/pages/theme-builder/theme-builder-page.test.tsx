import * as React from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { THEME_STORAGE_KEYS } from "../../constants"
import { buildThemeVars } from "../../engine/build-theme-vars"
import { themeStore } from "../../store/theme-store"
import type { ThemeAssignment, ThemeRecord } from "../../types"
import { ThemeBuilderPage } from "./theme-builder-page"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
  }),
}))

const THEME: ThemeRecord = {
  id: "theme-builder",
  name: "Builder",
  description: "Persisted",
  version: 1,
  seeds: {
    primary: "oklch(0.58 0.12 72)",
    accent: "oklch(0.64 0.16 245)",
  },
  radius: { base: 0.75 },
  typography: { scale: 1 },
  fonts: { body: "inter", heading: "space-grotesk" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const ASSIGNMENT: ThemeAssignment = {
  scope: "document",
  scopeId: "doc-one",
  themeId: THEME.id,
  updatedAt: "2026-01-01T00:00:00.000Z",
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  })
  fireEvent(window, new Event("resize"))
}

function resetStore(themes: ThemeRecord[] = [THEME], assignments = [ASSIGNMENT]) {
  setViewportWidth(1440)
  mocks.push.mockReset()
  window.localStorage.setItem(THEME_STORAGE_KEYS.themes, JSON.stringify(themes))
  window.localStorage.setItem(
    THEME_STORAGE_KEYS.assignments,
    JSON.stringify(assignments)
  )
  themeStore.setState({ themes, assignments })
}

function previewBoundary() {
  return document.querySelector("[data-theme-preview-id]") as HTMLElement
}

describe("ThemeBuilderPage", () => {
  it("creates a new primary-only theme without persisting fallback accent", () => {
    resetStore([], [])

    render(<ThemeBuilderPage mode="new" />)

    expect(screen.getByText("Not created")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /create theme/i }))

    const createdId = String(mocks.push.mock.calls.at(-1)?.[0]).split("/").at(-1)
    const created = themeStore
      .getState()
      .themes.find((theme) => theme.id === createdId)
    expect(created).toBeDefined()
    expect(created?.seeds).toEqual({
      primary: "oklch(0.58 0.12 72)",
    })
    expect(themeStore.getState().assignments).toEqual([])
    expect(mocks.push).toHaveBeenCalledWith(`/settings/themes/${created?.id}`)
  })

  it("loads authored accent presence and can reset accent back to absence", () => {
    resetStore()

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    expect(screen.getByLabelText("Authored accent")).toHaveValue(
      THEME.seeds.accent
    )
    fireEvent.click(
      screen.getByRole("button", { name: /reset to neutral default/i })
    )

    expect(screen.queryByLabelText("Authored accent")).not.toBeInTheDocument()
    expect(screen.getByText("Using neutral default")).toBeInTheDocument()
  })

  it("customizes absent accent while keeping a neutral-equivalent value authored", () => {
    resetStore([{ ...THEME, seeds: { primary: THEME.seeds.primary } }], [])

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    fireEvent.click(screen.getByRole("button", { name: /customize accent/i }))

    expect(screen.getByLabelText("Authored accent")).toHaveValue(
      "oklch(0.62 0 0)"
    )
    expect(screen.getByText("Customized")).toBeInTheDocument()
  })

  it("edits primary seed inside preview boundary without touching html", () => {
    resetStore()
    document.documentElement.style.setProperty("--primary-500", "root-primary")

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    const nextPrimary = "oklch(0.72 0.14 90)"
    fireEvent.change(screen.getByLabelText("Primary"), {
      target: { value: nextPrimary },
    })

    expect(previewBoundary().style.getPropertyValue("--primary-500")).toBe(
      buildThemeVars({ ...THEME, seeds: { ...THEME.seeds, primary: nextPrimary } })[
        "--primary-500"
      ]
    )
    expect(document.documentElement.style.getPropertyValue("--primary-500")).toBe(
      "root-primary"
    )
  })

  it("saves existing theme to the same ID without mutating assignments", () => {
    resetStore()
    const beforeAssignments = JSON.stringify(themeStore.getState().assignments)

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)
    fireEvent.change(screen.getByLabelText("Theme name"), {
      target: { value: "Updated builder" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }))

    const saved = themeStore
      .getState()
      .themes.find((theme) => theme.id === THEME.id)
    expect(saved).toMatchObject({
      id: THEME.id,
      name: "Updated builder",
    })
    expect(JSON.stringify(themeStore.getState().assignments)).toBe(
      beforeAssignments
    )
  })

  it("saves as new through shortcut without changing source assignments", () => {
    resetStore()
    const beforeAssignments = JSON.stringify(themeStore.getState().assignments)

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)
    fireEvent.change(screen.getByLabelText("Theme name"), {
      target: { value: "Variation" },
    })
    fireEvent.keyDown(window, {
      key: "s",
      metaKey: true,
      shiftKey: true,
    })

    const themes = themeStore.getState().themes
    const sourceTheme = themes.find((theme) => theme.id === THEME.id)
    const copiedTheme = themes.find(
      (theme) => theme.id !== THEME.id && theme.name === "Variation copy"
    )

    expect(sourceTheme).toMatchObject({ id: THEME.id, name: THEME.name })
    expect(copiedTheme).toMatchObject({
      name: "Variation copy",
    })
    expect(copiedTheme?.id).not.toBe(THEME.id)
    expect(JSON.stringify(themeStore.getState().assignments)).toBe(
      beforeAssignments
    )
  })

  it("reverts persisted fields without resetting preview preferences or section", () => {
    resetStore()

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)
    fireEvent.change(screen.getByLabelText("Scenario"), {
      target: { value: "dashboard" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Typography" }))
    fireEvent.change(screen.getByLabelText("Theme name"), {
      target: { value: "Changed" },
    })
    fireEvent.click(screen.getByRole("button", { name: /revert/i }))

    expect(screen.getByLabelText("Theme name")).toHaveValue(THEME.name)
    expect(screen.getByLabelText("Scenario")).toHaveValue("dashboard")
    expect(screen.getByRole("button", { name: "Typography" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      within(screen.getByRole("complementary")).getByText("Typography")
    ).toBeInTheDocument()
  })

  it("uses compact preview toolbar controls without losing preview state", () => {
    resetStore()

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    fireEvent.change(screen.getByLabelText("Scenario"), {
      target: { value: "dashboard" },
    })
    fireEvent.change(screen.getByLabelText("Viewport"), {
      target: { value: "tablet" },
    })
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }))
    fireEvent.click(screen.getByRole("button", { name: "Shape" }))

    setViewportWidth(1024)

    expect(screen.getByLabelText("Scenario")).toHaveValue("dashboard")
    expect(screen.getByLabelText("Viewport")).toHaveValue("tablet")
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute(
      "data-state",
      "on"
    )
    expect(screen.getByRole("button", { name: "Shape" })).toHaveAttribute(
      "aria-current",
      "page"
    )
  })

  it("allows the inspector to close and reopen with focus returned to the invoker", async () => {
    resetStore()

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    const closeButton = screen.getByRole("button", {
      name: /close shape inspector|close colors inspector/i,
    })
    fireEvent.click(closeButton)

    const reopenButton = screen.getByRole("button", { name: /edit colors/i })
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()

    fireEvent.click(reopenButton)
    expect(screen.getByRole("complementary")).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", {
        name: /close colors inspector/i,
      })
    )
    await waitFor(() => expect(reopenButton).toHaveFocus())
  })

  it("keeps preview status outside the scrollable preview workbench", () => {
    resetStore()

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    const status = screen.getByText(/previewing saved theme/i)
    const previewScroll = screen.getByTestId("theme-preview-scroll")

    expect(status).toBeVisible()
    expect(previewScroll).not.toContainElement(status)
  })

  it("uses a horizontal labeled section strip at constrained widths", () => {
    resetStore()
    setViewportWidth(1024)

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    expect(screen.getByLabelText("Theme sections")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    )
    expect(screen.getByRole("button", { name: "Colors" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Typography" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Shape" })).toBeVisible()
  })

  it("marks the builder shell as owning desktop overflow", () => {
    resetStore()
    setViewportWidth(1280)

    render(<ThemeBuilderPage mode="edit" themeId={THEME.id} />)

    expect(screen.getByTestId("theme-builder-shell")).toHaveClass("overflow-hidden")
    expect(screen.getByTestId("theme-builder-grid")).toHaveClass("min-w-0")
  })

  it("shows unavailable state for unknown saved theme IDs", () => {
    resetStore([THEME], [])

    render(<ThemeBuilderPage mode="edit" themeId="missing-theme" />)

    expect(screen.getByText("Theme unavailable")).toBeInTheDocument()
  })
})
