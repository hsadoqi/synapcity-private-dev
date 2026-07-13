import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  Sheet,
  SheetContent,
} from "@workspace/ui/components/primitives/sheet"

import { ThemeFormSheet } from "./theme-form-sheet"

describe("ThemeFormSheet", () => {
  it("previews theme tokens and restores them when cancelled", () => {
    document.documentElement.style.setProperty("--primary-500", "original")
    const onClose = vi.fn()
    const { unmount } = renderSheet({ onClose })

    fireEvent.change(screen.getByLabelText("Primary hexadecimal value"), {
      target: { value: "#8B5CF6" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Dark" }))

    expect(
      document.documentElement.style.getPropertyValue("--primary-500")
    ).not.toBe("original")
    expect(document.documentElement).toHaveClass("dark")

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    unmount()

    expect(onClose).toHaveBeenCalledOnce()
    expect(
      document.documentElement.style.getPropertyValue("--primary-500")
    ).toBe("original")
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("submits the complete applied theme and keeps full radius accessible", () => {
    const onSubmit = vi.fn()
    renderSheet({ onSubmit })

    fireEvent.click(screen.getByRole("button", { name: "full" }))
    expect(screen.getByLabelText("Border Radius")).toHaveValue("14")
    expect(screen.getByRole("button", { name: "full" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.change(screen.getByLabelText("Theme Name"), {
      target: { value: "  Editorial  " },
    })
    fireEvent.click(screen.getByRole("button", { name: "Apply" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Editorial", borderRadius: 999 })
    )
  })
})

function renderSheet({
  onClose = vi.fn(),
  onSubmit,
}: {
  onClose?: () => void
  onSubmit?: React.ComponentProps<typeof ThemeFormSheet>["onSubmit"]
}) {
  return render(
    <Sheet open>
      <SheetContent>
        <ThemeFormSheet isOpen onClose={onClose} onSubmit={onSubmit} />
      </SheetContent>
    </Sheet>
  )
}
