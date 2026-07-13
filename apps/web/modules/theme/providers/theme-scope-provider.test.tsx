import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ThemeScopeProvider } from "./theme-scope-provider"
import { DEFAULT_THEME_RECORD } from "../types"

describe("ThemeScopeProvider", () => {
  it("removes explicit variables when a scope returns to inheritance", () => {
    const { rerender } = render(
      <ThemeScopeProvider theme={DEFAULT_THEME_RECORD}>
        <span>Content</span>
      </ThemeScopeProvider>
    )

    const scope = screen.getByText("Content").parentElement
    expect(scope).toHaveAttribute("data-theme-source", "explicit")
    expect(scope?.style.getPropertyValue("--primary-500")).not.toBe("")

    rerender(
      <ThemeScopeProvider theme={null}>
        <span>Content</span>
      </ThemeScopeProvider>
    )

    expect(scope).toHaveAttribute("data-theme-source", "inherited")
    expect(scope?.style.getPropertyValue("--primary-500")).toBe("")
  })
})
