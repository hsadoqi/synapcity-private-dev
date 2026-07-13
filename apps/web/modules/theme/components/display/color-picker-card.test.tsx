import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ColorPickerCard } from "./color-picker-card"

describe("ColorPickerCard", () => {
  it("falls back to a valid HEX color when its inputs are invalid", () => {
    render(
      <ColorPickerCard
        label="Primary"
        formData="invalid"
        defaultFormData="invalid"
        onChange={vi.fn()}
        hideLabel
      />
    )

    expect(screen.getByLabelText("Choose Primary color")).toHaveValue(
      "#3b82f6"
    )
  })

  it("renders preset colors outside an overflow-clipping form", () => {
    render(
      <form data-testid="scrolling-form" className="overflow-y-auto">
        <ColorPickerCard
          label="Primary"
          formData="#3B82F6"
          defaultFormData="#3B82F6"
          onChange={vi.fn()}
          hideLabel
        />
      </form>
    )

    const trigger = screen.getByRole("button", { name: "Presets" })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "Enter" })

    const preset = screen.getByRole("menuitem", { name: "Select #8B5CF6" })
    expect(screen.getByTestId("scrolling-form")).not.toContainElement(preset)
  })
})
