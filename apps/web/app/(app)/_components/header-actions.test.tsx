import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { AppRouteContext } from "@/modules/routing"
import { AppContextToolbar } from "./header-actions"

function routeContext(pathname: string): AppRouteContext {
  return {
    pathname,
    section: "theme-settings",
    title: "Themes",
    description: "Reusable visual systems",
    navItems: [],
  }
}

describe("AppContextToolbar", () => {
  it("suppresses library toolbar controls on theme builder routes", () => {
    const { rerender } = render(
      <AppContextToolbar routeContext={routeContext("/settings/themes/new")} />
    )

    expect(screen.queryByText("View controls")).not.toBeInTheDocument()
    expect(screen.queryByText("Controls for themes")).not.toBeInTheDocument()
    expect(screen.queryByText("Filter")).not.toBeInTheDocument()
    expect(screen.queryByText("Sort")).not.toBeInTheDocument()

    rerender(
      <AppContextToolbar
        routeContext={routeContext("/settings/themes/theme-warm-ledger")}
      />
    )

    expect(screen.queryByText("View controls")).not.toBeInTheDocument()
    expect(screen.queryByText("Controls for themes")).not.toBeInTheDocument()
    expect(screen.queryByText("Filter")).not.toBeInTheDocument()
    expect(screen.queryByText("Sort")).not.toBeInTheDocument()
  })

  it("retains library toolbar controls on the theme library route", () => {
    render(<AppContextToolbar routeContext={routeContext("/settings/themes")} />)

    expect(screen.getByText("View controls")).toBeInTheDocument()
    expect(screen.getByText("Controls for themes")).toBeInTheDocument()
    expect(screen.getByText("Filter")).toBeInTheDocument()
    expect(screen.getByText("Sort")).toBeInTheDocument()
  })
})
