"use client"

import * as React from "react"

import { AppHeader } from "@/app/(home)/_components/header/app-header"
import {
  ContextPanelSheet,
  DesktopContextPanel,
  useContextPanelController,
  useIsDesktopWorkspace,
} from "@/components/context-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useResizablePanelRef,
} from "@workspace/ui/components"
import { SidebarInset } from "@workspace/ui/components/primitives/sidebar"

import { AppSidebar } from "../sidebar/app-sidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isDesktopWorkspace = useIsDesktopWorkspace()
  const contextPanelRef = useResizablePanelRef()
  const contextPanel = useContextPanelController(contextPanelRef)
  const [isMobileContextOpen, setIsMobileContextOpen] = React.useState(false)
  const mainContent = (
    <main id="primary-content" className="size-full min-w-0 overflow-auto">
      {children}
    </main>
  )

  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-h-svh min-w-0 overflow-hidden">
        <AppHeader onOpenContextPanel={() => setIsMobileContextOpen(true)} />

        <div className="min-h-0 flex-1">
          {isDesktopWorkspace ? (
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel
                id="workspace-content"
                defaultSize="68%"
                minSize="28rem"
              >
                {mainContent}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                id="context-panel"
                panelRef={contextPanelRef}
                defaultSize="24rem"
                minSize="18rem"
                maxSize="30rem"
                collapsible
                collapsedSize="2.5rem"
                onResize={contextPanel.syncCollapsedState}
              >
                <DesktopContextPanel
                  collapsed={contextPanel.isCollapsed}
                  onCollapse={contextPanel.collapse}
                  onExpand={contextPanel.expand}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            mainContent
          )}
        </div>
      </SidebarInset>

      <ContextPanelSheet
        open={isMobileContextOpen}
        onOpenChange={setIsMobileContextOpen}
      />
    </>
  )
}
