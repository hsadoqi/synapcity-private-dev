"use client"

import * as React from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useResizablePanelRef,
} from "@workspace/ui/components/primitives/resizable"

import { ContextualSidebarContainer } from "./contextual-sidebar-container"

export function ContextualPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const contextPanelRef = useResizablePanelRef()
  const [contextPanelCollapsed, setContextPanelCollapsed] =
    React.useState(false)

  function handleContextPanelCollapsedChange(nextCollapsed: boolean) {
    setContextPanelCollapsed(nextCollapsed)

    if (nextCollapsed) {
      contextPanelRef.current?.collapse()
      return
    }

    contextPanelRef.current?.expand()
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 xl:hidden">{children}</div>
      <div className="hidden min-h-0 flex-1 xl:flex">
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1"
        >
          <ResizablePanel
            id="primary-content"
            defaultSize="74%"
            minSize="52%"
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
              {children}
            </div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="bg-border/80 hover:bg-ring focus-visible:bg-ring"
          />
          <ResizablePanel
            id="context-panel"
            panelRef={contextPanelRef}
            defaultSize="26%"
            minSize="260px"
            maxSize="42%"
            collapsible
            collapsedSize="56px"
            groupResizeBehavior="preserve-pixel-size"
            onResize={(size) => {
              const nextCollapsed = size.inPixels <= 80
              setContextPanelCollapsed((current) =>
                current === nextCollapsed ? current : nextCollapsed
              )
            }}
          >
            <ContextualSidebarContainer
              collapsed={contextPanelCollapsed}
              onCollapsedChange={handleContextPanelCollapsedChange}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
