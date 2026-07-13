import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FontPickerCard } from "./font-picker-card"
import type { ThemeFormData } from "../form-components/theme-form-popover"

const formData: ThemeFormData = {
  primaryColor: "#3B82F6",
  headingFont: "System",
  bodyFont: "Inter",
  textScale: 1.125,
  darkMode: false,
  borderRadius: 8,
  name: "",
  description: "",
}

describe("FontPickerCard", () => {
  it("portals font options outside an overflow-clipping form", () => {
    render(
      <form data-testid="scrolling-form" className="overflow-y-auto">
        <FontPickerCard
          data={formData}
          defaultData={formData}
          onChange={vi.fn()}
        />
      </form>
    )

    const trigger = screen.getByRole("button", { name: "Heading font" })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "Enter" })

    const menu = screen.getByRole("menu", { name: "Heading font" })
    expect(menu).toBeVisible()
    expect(screen.getByTestId("scrolling-form")).not.toContainElement(menu)
  })
})
