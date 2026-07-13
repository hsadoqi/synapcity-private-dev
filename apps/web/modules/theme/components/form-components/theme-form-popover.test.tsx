import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ThemeFormPopover } from "./theme-form-popover"

describe("ThemeFormPopover", () => {
  it("keeps selected colors in form state and submits them", () => {
    const onSubmit = vi.fn()

    render(
      <ThemeFormPopover onClose={vi.fn()} onSubmit={onSubmit} />
    )

    const primaryInput = screen.getByLabelText("Primary hexadecimal value")
    fireEvent.change(primaryInput, { target: { value: "#8B5CF6" } })

    expect(primaryInput).toHaveValue("#8B5CF6")
    expect(
      document.documentElement.style.getPropertyValue("--primary-500")
    ).not.toBe("")

    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ primaryColor: "#8B5CF6" })
    )
  })

  it("previews colors outside the form and restores them on cancel", () => {
    document.documentElement.style.setProperty(
      "--primary-500",
      "oklch(0.5 0.1 120)"
    )
    const onClose = vi.fn()
    const { unmount } = render(<ThemeFormPopover onClose={onClose} />)

    fireEvent.change(screen.getByLabelText("Primary hexadecimal value"), {
      target: { value: "#EC4899" },
    })

    expect(
      document.documentElement.style.getPropertyValue("--primary-500")
    ).not.toBe("oklch(0.5 0.1 120)")

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    unmount()

    expect(onClose).toHaveBeenCalledOnce()
    expect(
      document.documentElement.style.getPropertyValue("--primary-500")
    ).toBe("oklch(0.5 0.1 120)")
  })

  it("adds and removes the optional accent color", () => {
    render(<ThemeFormPopover onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: "Add accent" }))
    expect(screen.getByLabelText("Accent hexadecimal value")).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(
      screen.queryByLabelText("Accent hexadecimal value")
    ).not.toBeInTheDocument()
  })

  it("previews dark mode and restores the previous mode on cancel", () => {
    document.documentElement.classList.remove("dark")
    const { unmount } = render(<ThemeFormPopover onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: "Dark" }))
    expect(document.documentElement).toHaveClass("dark")
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    unmount()

    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("keeps border radius in form state and previews it outside the form", () => {
    const onSubmit = vi.fn()
    render(<ThemeFormPopover onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole("tab", { name: "Design" }))
    fireEvent.click(screen.getByRole("button", { name: "lg" }))

    expect(screen.getByLabelText("Border Radius")).toHaveValue("12")
    expect(
      document.documentElement.style.getPropertyValue("--radius")
    ).toBe("0.75rem")

    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ borderRadius: 12 })
    )
  })

  it("keeps type scale in form state and previews it outside the form", () => {
    const onSubmit = vi.fn()
    render(<ThemeFormPopover onClose={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole("tab", { name: "Font" }))
    fireEvent.click(
      screen.getByRole("button", { name: "Increase Type Scale" })
    )

    expect(screen.getByLabelText("Type Scale")).toHaveValue("1.15")
    expect(
      document.documentElement.style.getPropertyValue("--type-scale")
    ).toBe("1.15")

    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ textScale: 1.15 })
    )
  })

  it("supports arrow-key navigation between editor tabs", () => {
    render(<ThemeFormPopover onClose={vi.fn()} />)

    const colorsTab = screen.getByRole("tab", { name: "Colors" })
    colorsTab.focus()
    fireEvent.keyDown(colorsTab, { key: "ArrowRight" })

    const fontTab = screen.getByRole("tab", { name: "Font" })
    expect(fontTab).toHaveFocus()
    expect(fontTab).toHaveAttribute("aria-selected", "true")
    expect(colorsTab).toHaveAttribute("tabindex", "-1")
  })

  it("previews selected font families outside the form", () => {
    render(<ThemeFormPopover onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole("tab", { name: "Font" }))

    const trigger = screen.getByRole("button", { name: "Heading font" })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "Enter" })
    fireEvent.click(screen.getByRole("menuitem", { name: "Georgia" }))

    expect(
      document.documentElement.style.getPropertyValue("--font-heading")
    ).toContain("Georgia")
  })
})
