import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useContextPanelController } from "./use-context-panel-controller"

function createPanelRef(isCollapsed = false) {
  let collapsed = isCollapsed

  return {
    current: {
      collapse: vi.fn(() => {
        collapsed = true
      }),
      expand: vi.fn(() => {
        collapsed = false
      }),
      isCollapsed: vi.fn(() => collapsed),
    },
  }
}

describe("useContextPanelController", () => {
  it("updates collapsed state when collapsing and expanding", () => {
    const panelRef = createPanelRef()
    const { result } = renderHook(() => useContextPanelController(panelRef))

    act(() => {
      result.current.collapse()
    })

    expect(panelRef.current.collapse).toHaveBeenCalledTimes(1)
    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.expand()
    })

    expect(panelRef.current.expand).toHaveBeenCalledTimes(1)
    expect(result.current.isCollapsed).toBe(false)
  })

  it("synchronizes state from the resizable panel boundary", () => {
    const panelRef = createPanelRef(true)
    const { result } = renderHook(() => useContextPanelController(panelRef))

    act(() => {
      result.current.syncCollapsedState()
    })

    expect(result.current.isCollapsed).toBe(true)
    expect(panelRef.current.isCollapsed).toHaveBeenCalledTimes(1)
  })

  it("keeps repeated synchronization of the same panel state stable", () => {
    const panelRef = createPanelRef(true)
    const { result } = renderHook(() => useContextPanelController(panelRef))

    act(() => {
      result.current.syncCollapsedState()
      result.current.syncCollapsedState()
    })

    expect(panelRef.current.isCollapsed).toHaveBeenCalledTimes(2)
    expect(panelRef.current.collapse).not.toHaveBeenCalled()
    expect(panelRef.current.expand).not.toHaveBeenCalled()
    expect(result.current.isCollapsed).toBe(true)
  })
})
