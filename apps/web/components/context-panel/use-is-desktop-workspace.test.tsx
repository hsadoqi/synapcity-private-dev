import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useIsDesktopWorkspace } from "./use-is-desktop-workspace"

function createMediaQueryList(
  matches: boolean,
  listeners: Partial<Pick<MediaQueryList, "addEventListener" | "removeEventListener">> = {}
) {
  return {
    addEventListener: listeners.addEventListener ?? vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: "(min-width: 1024px)",
    onchange: null,
    removeEventListener: listeners.removeEventListener ?? vi.fn(),
    removeListener: vi.fn(),
  } satisfies MediaQueryList
}

describe("useIsDesktopWorkspace", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("reads the initial matchMedia result", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      () => createMediaQueryList(true)
    )

    const { result } = renderHook(() => useIsDesktopWorkspace())

    expect(result.current).toBe(true)
  })

  it("subscribes and cleans up the media query listener", () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()

    vi.spyOn(window, "matchMedia").mockImplementation(
      () => createMediaQueryList(false, { addEventListener, removeEventListener })
    )

    const { unmount } = renderHook(() => useIsDesktopWorkspace())

    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function))

    act(() => {
      unmount()
    })

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    )
  })
})
