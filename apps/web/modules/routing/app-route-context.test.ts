import { describe, expect, it } from "vitest"

import { getAppRouteContext, isNavItemActive } from "./app-route-context"
import { getRouteKind } from "./get-route-kind"

describe("theme route context", () => {
  it("recognizes plural theme routes as the canonical theme settings section", () => {
    expect(getRouteKind("/settings/themes")).toBe("theme-settings")
    expect(getRouteKind("/settings/themes/new")).toBe("theme-settings")
    expect(getRouteKind("/settings/themes/theme-one")).toBe("theme-settings")

    const context = getAppRouteContext("/settings/themes/theme-one")

    expect(context).toMatchObject({
      section: "theme-settings",
      title: "Themes",
      description: "Reusable visual systems",
    })
  })

  it("marks the theme navigation item active for nested plural routes", () => {
    const context = getAppRouteContext("/settings/themes/theme-one")
    const themeItem = context.navItems.find((item) => item.label === "Themes")

    expect(themeItem?.href).toBe("/settings/themes")
    expect(themeItem).toBeDefined()
    expect(isNavItemActive(themeItem!, "/settings/themes/theme-one")).toBe(true)
  })
})
