import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useSidebar } from "@workspace/ui/components/primitives/sidebar"
import { AppProviders } from "./app-providers"

const pathnameState = vi.hoisted(() => ({
  value: "/",
}))

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}))

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  })
  fireEvent(window, new Event("resize"))
}

function SidebarProbe() {
  const { open, setOpen } = useSidebar()

  return (
    <div>
      <p data-testid="sidebar-state">{open ? "expanded" : "collapsed"}</p>
      <button type="button" onClick={() => setOpen(false)}>
        Collapse sidebar
      </button>
      <button type="button" onClick={() => setOpen(true)}>
        Expand sidebar
      </button>
    </div>
  )
}

function renderWithProviders() {
  return render(
    <AppProviders>
      <SidebarProbe />
    </AppProviders>
  )
}

describe("AppProviders builder sidebar coordination", () => {
  it("keeps an open sidebar expanded for wide theme builder routes", async () => {
    pathnameState.value = "/settings/themes/new"
    setViewportWidth(1600)

    renderWithProviders()

    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("expanded")
    )
  })

  it("temporarily collapses an open sidebar on cramped theme builder routes", async () => {
    pathnameState.value = "/settings/themes/new"
    setViewportWidth(1280)

    renderWithProviders()

    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("collapsed")
    )
  })

  it("restores the prior open sidebar state after leaving the builder", async () => {
    pathnameState.value = "/settings/themes/theme-warm-ledger"
    setViewportWidth(1280)
    const view = renderWithProviders()

    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("collapsed")
    )

    pathnameState.value = "/documents"
    view.rerender(
      <AppProviders>
        <SidebarProbe />
      </AppProviders>
    )

    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("expanded")
    )
  })

  it("preserves an initially collapsed sidebar after leaving the builder", async () => {
    pathnameState.value = "/documents"
    setViewportWidth(1280)
    const view = renderWithProviders()

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }))
    expect(screen.getByTestId("sidebar-state")).toHaveTextContent("collapsed")

    pathnameState.value = "/settings/themes/new"
    view.rerender(
      <AppProviders>
        <SidebarProbe />
      </AppProviders>
    )
    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("collapsed")
    )

    pathnameState.value = "/documents"
    view.rerender(
      <AppProviders>
        <SidebarProbe />
      </AppProviders>
    )

    await waitFor(() =>
      expect(screen.getByTestId("sidebar-state")).toHaveTextContent("collapsed")
    )
  })
})
