import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const contextPanelState = vi.hoisted(() => ({
  isCollapsed: false,
  isDesktop: true,
}))

vi.mock("../sidebar/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}))

vi.mock("@/app/(home)/_components/header/app-header", () => ({
  AppHeader: ({
    onOpenContextPanel,
  }: {
    onOpenContextPanel?: () => void
  }) => (
    <button type="button" onClick={onOpenContextPanel}>
      Open context panel
    </button>
  ),
}))

vi.mock("@/components/context-panel", () => ({
  ContextPanelSheet: ({ open }: { open: boolean }) =>
    open ? <div>Mobile context sheet</div> : null,
  DesktopContextPanel: ({ collapsed }: { collapsed: boolean }) => (
    <div>{collapsed ? "Desktop context collapsed" : "Desktop context open"}</div>
  ),
  useContextPanelController: () => ({
    collapse: vi.fn(),
    expand: vi.fn(),
    isCollapsed: contextPanelState.isCollapsed,
    syncCollapsedState: vi.fn(),
  }),
  useIsDesktopWorkspace: () => contextPanelState.isDesktop,
}))

vi.mock("@workspace/ui/components", async () => {
  const React = await import("react")

  return {
    ResizableHandle: () => <div data-testid="resizable-handle" />,
    ResizablePanel: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="desktop-layout">{children}</div>
    ),
    useResizablePanelRef: () =>
      React.useRef({
        collapse: vi.fn(),
        expand: vi.fn(),
        isCollapsed: () => false,
      }),
  }
})

vi.mock("@workspace/ui/components/primitives/sidebar", () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

import AppShell from "./app-shell"

describe("AppShell", () => {
  beforeEach(() => {
    contextPanelState.isCollapsed = false
    contextPanelState.isDesktop = true
  })

  it("renders the desktop resizable layout in desktop mode", () => {
    render(
      <AppShell>
        <div>Workspace</div>
      </AppShell>
    )

    expect(screen.getByTestId("desktop-layout")).toBeInTheDocument()
    expect(screen.getByText("Desktop context open")).toBeInTheDocument()
    expect(screen.queryByText("Mobile context sheet")).not.toBeInTheDocument()
  })

  it("renders mobile mode without the desktop resizable layout", () => {
    contextPanelState.isDesktop = false

    render(
      <AppShell>
        <div>Workspace</div>
      </AppShell>
    )

    expect(screen.queryByTestId("desktop-layout")).not.toBeInTheDocument()
    expect(screen.getByText("Workspace")).toBeInTheDocument()
  })

  it("keeps mobile sheet state independent from desktop collapsed state", () => {
    contextPanelState.isCollapsed = true
    contextPanelState.isDesktop = false

    render(
      <AppShell>
        <div>Workspace</div>
      </AppShell>
    )

    fireEvent.click(screen.getByRole("button", { name: "Open context panel" }))

    expect(screen.getByText("Mobile context sheet")).toBeInTheDocument()
  })
})
