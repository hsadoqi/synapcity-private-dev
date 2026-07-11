import { describe, expect, it } from "vitest"

import { getAppRouteContext, isNavItemActive } from "./app-route-context"
import { getRouteKind } from "./get-route-kind"

// NOTE: documents fork only has the single-page /settings/theme editor
// (theme fork's newer /settings/themes CRUD flow with list/detail/new
// routes hasn't been ported here — see ROADMAP.md). This test targets
// what actually exists in this fork; do not resync from theme's copy
// without also porting the underlying pages.
describe("theme route context", () => {
  it("recognizes the singular theme settings route", () => {
    expect(getRouteKind("/settings/theme")).toBe("theme-settings")

    const context = getAppRouteContext("/settings/theme")

    expect(context).toMatchObject({
      section: "theme-settings",
      title: "Theme",
      description: "Reusable visual system",
    })
  })

  it("marks the theme navigation item active for the settings route", () => {
    const context = getAppRouteContext("/settings/theme")
    const themeItem = context.navItems.find((item) => item.label === "Theme")

    expect(themeItem?.href).toBe("/settings/theme")
    expect(themeItem).toBeDefined()
    expect(isNavItemActive(themeItem!, "/settings/theme")).toBe(true)
  })
})
