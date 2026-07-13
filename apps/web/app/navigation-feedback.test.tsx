import * as React from "react"
import Link from "next/link"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NavigationFeedback } from "./navigation-feedback"

let pathname = "/"

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}))

describe("NavigationFeedback", () => {
  beforeEach(() => {
    pathname = "/"
    vi.useFakeTimers()
  })

  afterEach(() => vi.useRealTimers())

  it("shows feedback for an internal navigation and clears it on route change", () => {
    const { rerender } = render(
      <>
        <NavigationFeedback />
        <Link href="/documents" onClick={(event) => event.preventDefault()}>
          Documents
        </Link>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "Documents" }))
    expect(screen.getByRole("status")).toHaveTextContent("Loading page")

    pathname = "/documents"
    rerender(
      <>
        <NavigationFeedback />
        <Link href="/documents" onClick={(event) => event.preventDefault()}>
          Documents
        </Link>
      </>
    )

    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("ignores external and modified link clicks", () => {
    render(
      <>
        <NavigationFeedback />
        <a href="https://example.com" onClick={(event) => event.preventDefault()}>
          External
        </a>
        <Link href="/documents" onClick={(event) => event.preventDefault()}>
          Documents
        </Link>
      </>
    )

    fireEvent.click(screen.getByRole("link", { name: "External" }))
    fireEvent.click(screen.getByRole("link", { name: "Documents" }), {
      metaKey: true,
    })

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
