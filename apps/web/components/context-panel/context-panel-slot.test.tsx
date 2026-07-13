import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components"

import { DesktopContextPanel } from "./desktop-panel-content"
import { ContextPanelSheet } from "./context-panel-sheet"
import {
  ContextPanelSlotProvider,
  useRegisterContextPanel,
  type ContextPanelSlot,
} from "./context-panel-slot"

/**
 * A minimal stand-in for a route/page component that publishes context
 * panel content — exercises the same public hook a real page (e.g.
 * DocumentWorkspace) uses, without pulling in document-specific markup.
 */
function Registrant({
  title,
  bodyText,
  body,
  slot: explicitSlot,
  enabled = true,
}: {
  title?: string
  bodyText?: string
  body?: React.ReactNode
  slot?: ContextPanelSlot
  enabled?: boolean
}) {
  const slot: ContextPanelSlot | null = enabled
    ? (explicitSlot ?? {
        header: { title: title!, description: `${title} description` },
        body: body ?? <div data-testid="registrant-body">{bodyText}</div>,
      })
    : null

  useRegisterContextPanel(slot)
  return null
}

// Generic fallback content (context-panel-content.tsx) renders this section
// title unconditionally when no slot is registered — used as the marker
// for "restored to generic panel" in these tests.
const GENERIC_FALLBACK_MARKER = "Dashboard"

const documentSlot: ContextPanelSlot = {
  header: {
    title: "Document",
    description: "Product vision",
  },
  body: <div data-testid="document-panel-body">Document outline</div>,
}

function DesktopHarness() {
  return (
    <DesktopContextPanel collapsed={false} onCollapse={() => {}} onExpand={() => {}} />
  )
}

function MobileHarness() {
  return <ContextPanelSheet open onOpenChange={() => {}} />
}

describe("context panel slot", () => {
  it("renders registered metadata and body in the desktop host", () => {
    render(
      <ContextPanelSlotProvider>
        <Registrant slot={documentSlot} />
        <DesktopHarness />
      </ContextPanelSlotProvider>
    )

    const panel = screen.getByLabelText("Context panel")
    expect(
      within(panel).getByRole("heading", { name: "Document" })
    ).toBeInTheDocument()
    expect(within(panel).getByTestId("document-panel-body")).toHaveTextContent(
      "Document outline"
    )
    expect(
      within(panel).queryByRole("heading", { name: "Outline" })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()
  })

  it("renders registered metadata and body in the mobile dialog", () => {
    render(
      <ContextPanelSlotProvider>
        <Registrant slot={documentSlot} />
        <MobileHarness />
      </ContextPanelSlotProvider>
    )

    const dialog = screen.getByRole("dialog")
    expect(
      within(dialog).getByRole("heading", { name: "Document" })
    ).toBeInTheDocument()
    expect(within(dialog).getByText("Product vision")).toBeInTheDocument()
    expect(within(dialog).getByTestId("document-panel-body")).toHaveTextContent(
      "Document outline"
    )
  })

  it("restores the generic panel once the registering route unmounts", () => {
    function Harness({ showRoute }: { showRoute: boolean }) {
      return (
        <ContextPanelSlotProvider>
          {showRoute && (
            <Registrant title="Document" bodyText="Outline for doc-1" />
          )}
          <DesktopHarness />
        </ContextPanelSlotProvider>
      )
    }

    const { rerender } = render(<Harness showRoute />)
    expect(screen.getByText("Outline for doc-1")).toBeInTheDocument()

    rerender(<Harness showRoute={false} />)

    expect(screen.queryByText("Outline for doc-1")).not.toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
  })

  it("shows the generic fallback in the desktop host", () => {
    render(
      <ContextPanelSlotProvider>
        <DesktopHarness />
      </ContextPanelSlotProvider>
    )

    expect(
      screen.getByRole("heading", { name: "Context" })
    ).toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
    expect(
      screen.getByRole("navigation", { name: "Context panel navigation" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Settings" })).toHaveLength(2)
  })

  it("shows the generic fallback in the mobile dialog", () => {
    render(
      <ContextPanelSlotProvider>
        <MobileHarness />
      </ContextPanelSlotProvider>
    )

    const dialog = screen.getByRole("dialog")
    expect(
      within(dialog).getByRole("heading", { name: "Context" })
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText("Tools and information for this workspace.")
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole("navigation", {
        name: "Context panel navigation",
      })
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument()
    expect(
      within(dialog).getAllByRole("button", { name: "Settings" })
    ).toHaveLength(2)
  })

  it("renders only Expand while collapsed and restores controlled registered state", () => {
    const onExpand = vi.fn()

    function Harness({ collapsed }: { collapsed: boolean }) {
      const [activeSection, setActiveSection] = React.useState("outline")

      return (
        <TooltipProvider>
          <ContextPanelSlotProvider>
            <Registrant
              title="Document"
              body={
                <div data-testid="controlled-document-panel">
                  <output aria-label="Active document section">
                    {activeSection}
                  </output>
                  <button
                    type="button"
                    onClick={() => setActiveSection("properties")}
                  >
                    Select properties
                  </button>
                </div>
              }
            />
            <DesktopContextPanel
              collapsed={collapsed}
              onCollapse={() => {}}
              onExpand={onExpand}
            />
          </ContextPanelSlotProvider>
        </TooltipProvider>
      )
    }

    const { rerender } = render(<Harness collapsed={false} />)
    fireEvent.click(
      screen.getByRole("button", { name: "Select properties" })
    )
    expect(screen.getByLabelText("Active document section")).toHaveTextContent(
      "properties"
    )

    rerender(<Harness collapsed />)

    const collapsedPanel = screen.getByLabelText("Context panel")
    expect(within(collapsedPanel).getAllByRole("button")).toHaveLength(1)
    expect(
      within(collapsedPanel).getByRole("button", {
        name: "Expand context panel",
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId("controlled-document-panel")
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(collapsedPanel).getByRole("button", {
        name: "Expand context panel",
      })
    )
    expect(onExpand).toHaveBeenCalledOnce()

    rerender(<Harness collapsed={false} />)
    expect(screen.getByLabelText("Active document section")).toHaveTextContent(
      "properties"
    )
  })

  it("updates the registered content when the active document changes", () => {
    function Harness({ docId }: { docId: string }) {
      return (
        <ContextPanelSlotProvider>
          <Registrant title={`Document ${docId}`} bodyText={`Outline for ${docId}`} />
          <DesktopHarness />
        </ContextPanelSlotProvider>
      )
    }

    const { rerender } = render(<Harness docId="doc-1" />)
    expect(screen.getByText("Document doc-1")).toBeInTheDocument()
    expect(screen.getByText("Outline for doc-1")).toBeInTheDocument()

    rerender(<Harness docId="doc-2" />)

    expect(screen.getByText("Document doc-2")).toBeInTheDocument()
    expect(screen.getByText("Outline for doc-2")).toBeInTheDocument()
    expect(screen.queryByText("Outline for doc-1")).not.toBeInTheDocument()
  })

  it("feeds the same active slot to both the desktop panel and the mobile sheet", () => {
    render(
      <ContextPanelSlotProvider>
        <Registrant title="Document" bodyText="Shared outline content" />
        <DesktopHarness />
        <MobileHarness />
      </ContextPanelSlotProvider>
    )

    // Two independent consumers, one registration — both must reflect it.
    const desktop = screen.getByLabelText("Context panel")
    expect(within(desktop).getByText("Shared outline content")).toBeInTheDocument()

    const sheetTitle = screen.getAllByText("Document")
    expect(sheetTitle.length).toBeGreaterThanOrEqual(2)

    const bodies = screen.getAllByText("Shared outline content")
    expect(bodies).toHaveLength(2)
  })

  it("does not leave a stale registration under React StrictMode", () => {
    function Harness({ showRoute }: { showRoute: boolean }) {
      return (
        <React.StrictMode>
          <ContextPanelSlotProvider>
            {showRoute && (
              <Registrant title="Document" bodyText="Strict mode content" />
            )}
            <DesktopHarness />
          </ContextPanelSlotProvider>
        </React.StrictMode>
      )
    }

    const { rerender } = render(<Harness showRoute />)
    // Strict mode double-invokes effects in dev; the net result after
    // settling must still be exactly one active registration.
    expect(screen.getAllByText("Strict mode content")).toHaveLength(1)

    rerender(<Harness showRoute={false} />)

    expect(screen.queryByText("Strict mode content")).not.toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
  })

  it("resolves simultaneous registrations with last-committed-wins precedence", () => {
    // Documented precedence rule: the slot is a single value, not a stack.
    // When two registrants are mounted at once (not a supported pattern in
    // the real app, but possible if a routing bug mounts two route-scoped
    // components together), the later one in commit order determines the
    // active slot.
    render(
      <ContextPanelSlotProvider>
        <Registrant title="First" bodyText="First body" />
        <Registrant title="Second" bodyText="Second body" />
        <DesktopHarness />
      </ContextPanelSlotProvider>
    )

    expect(screen.getByText("Second")).toBeInTheDocument()
    expect(screen.getByText("Second body")).toBeInTheDocument()
    expect(screen.queryByText("First")).not.toBeInTheDocument()
    expect(screen.queryByText("First body")).not.toBeInTheDocument()
  })

  it("keeps the active registration active when an older, superseded registration unmounts (older cannot clear newer)", () => {
    // Regression coverage for the registration-cleanup identity bug: an
    // earlier version of `useRegisterContextPanel` cleared the shared slot
    // unconditionally on unmount, so an older registration unmounting
    // *after* a newer one had already taken over would incorrectly null
    // out the newer registration's content. Cleanup must now check that
    // it's still clearing its own registration before doing so.
    function Harness({
      showA,
      showB,
    }: {
      showA: boolean
      showB: boolean
    }) {
      return (
        <ContextPanelSlotProvider>
          {showA && <Registrant title="First" bodyText="First body" />}
          {showB && <Registrant title="Second" bodyText="Second body" />}
          <DesktopHarness />
        </ContextPanelSlotProvider>
      )
    }

    // 1. Registration A mounts and becomes active.
    const { rerender } = render(<Harness showA showB={false} />)
    expect(screen.getByText("First")).toBeInTheDocument()

    // 2. Registration B mounts later and becomes active (last-committed-wins,
    // since B's registration effect commits after A's).
    rerender(<Harness showA showB />)
    expect(screen.getByText("Second")).toBeInTheDocument()
    expect(screen.queryByText("First")).not.toBeInTheDocument()

    // 3. Registration A unmounts.
    rerender(<Harness showA={false} showB />)

    // 4. Registration B remains active — A's cleanup must not have cleared it.
    expect(screen.getByText("Second")).toBeInTheDocument()
    expect(screen.getByText("Second body")).toBeInTheDocument()
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()

    // 5. Registration B unmounts.
    rerender(<Harness showA={false} showB={false} />)

    // 6. The slot falls back to the generic context-panel content.
    expect(screen.queryByText("Second")).not.toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
  })

  it("does not let a registration's own content updates disturb its identity, even when an older stale registration unmounts afterward", () => {
    function Harness({
      showA,
      bText,
    }: {
      showA: boolean
      bText: string
    }) {
      return (
        <ContextPanelSlotProvider>
          {showA && <Registrant title="First" bodyText="First body" />}
          <Registrant title="Second" bodyText={bText} />
          <DesktopHarness />
        </ContextPanelSlotProvider>
      )
    }

    // A mounts, then B mounts and wins (last-committed-wins).
    const { rerender } = render(<Harness showA bText="Second body v1" />)
    expect(screen.getByText("Second body v1")).toBeInTheDocument()

    // B's own content updates (new slot object, same hook instance/identity)
    // while A is still mounted. This must not create a window where the
    // registration is incorrectly cleared or reverted to A's content.
    rerender(<Harness showA bText="Second body v2" />)
    expect(screen.getByText("Second body v2")).toBeInTheDocument()
    expect(screen.queryByText("Second body v1")).not.toBeInTheDocument()
    expect(screen.queryByText("First body")).not.toBeInTheDocument()
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()

    // A (older, already-superseded) now unmounts. Its stale cleanup must
    // not be able to remove B's current — and since-updated — registration.
    rerender(<Harness showA={false} bText="Second body v2" />)
    expect(screen.getByText("Second body v2")).toBeInTheDocument()
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()
  })

  it("does not leave the slot empty or stale under React StrictMode when two registrations overlap", () => {
    // Extends the existing single-registrant StrictMode test to the
    // overlapping-registration case: StrictMode's dev-only double-invoke of
    // mount effects (setup → cleanup → setup again) must not let a stale
    // cleanup from that simulated cycle clear a registration that isn't its
    // own once both A and B are settled.
    function Harness({ showA, showB }: { showA: boolean; showB: boolean }) {
      return (
        <React.StrictMode>
          <ContextPanelSlotProvider>
            {showA && <Registrant title="First" bodyText="First body" />}
            {showB && <Registrant title="Second" bodyText="Second body" />}
            <DesktopHarness />
          </ContextPanelSlotProvider>
        </React.StrictMode>
      )
    }

    const { rerender } = render(<Harness showA showB={false} />)
    expect(screen.getAllByText("First")).toHaveLength(1)

    rerender(<Harness showA showB />)
    expect(screen.getAllByText("Second")).toHaveLength(1)
    expect(screen.queryByText("First")).not.toBeInTheDocument()

    rerender(<Harness showA={false} showB />)
    expect(screen.getAllByText("Second")).toHaveLength(1)
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()

    rerender(<Harness showA={false} showB={false} />)
    expect(screen.queryByText("Second")).not.toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
  })

  it("does not leak one route's content into an unrelated route", () => {
    function Harness({ route }: { route: "document" | "unrelated" }) {
      return (
        <ContextPanelSlotProvider>
          {route === "document" && (
            <Registrant title="Document" bodyText="Document-only content" />
          )}
          {/* An "unrelated" route mounts without registering anything,
              simulating navigation to a route with no panel content. */}
          <DesktopHarness />
        </ContextPanelSlotProvider>
      )
    }

    const { rerender } = render(<Harness route="document" />)
    expect(screen.getByText("Document-only content")).toBeInTheDocument()

    rerender(<Harness route="unrelated" />)

    expect(screen.queryByText("Document-only content")).not.toBeInTheDocument()
    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
  })
})
