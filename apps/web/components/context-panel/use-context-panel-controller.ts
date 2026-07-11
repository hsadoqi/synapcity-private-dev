"use client"

import * as React from "react"

type ResizablePanelApi = {
  collapse: () => void
  expand: () => void
  isCollapsed: () => boolean
}

type ResizablePanelRef = React.RefObject<ResizablePanelApi | null>

export function useContextPanelController(contextPanelRef: ResizablePanelRef) {
  const collapsedRef = React.useRef(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const updateCollapsedState = React.useCallback((collapsed: boolean) => {
    if (collapsedRef.current === collapsed) return

    collapsedRef.current = collapsed
    setIsCollapsed(collapsed)
  }, [])

  const collapse = React.useCallback(() => {
    contextPanelRef.current?.collapse()
    updateCollapsedState(true)
  }, [contextPanelRef, updateCollapsedState])

  const expand = React.useCallback(() => {
    contextPanelRef.current?.expand()
    updateCollapsedState(false)
  }, [contextPanelRef, updateCollapsedState])

  const syncCollapsedState = React.useCallback(() => {
    updateCollapsedState(contextPanelRef.current?.isCollapsed() ?? false)
  }, [contextPanelRef, updateCollapsedState])

  return {
    collapse,
    expand,
    isCollapsed,
    syncCollapsedState,
  }
}
