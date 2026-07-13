import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
  enabled = true,
}: {
  title: string
  bodyText: string
  enabled?: boolean
}) {
  const slot: ContextPanelSlot | null = enabled
    ? {
        header: { title, description: `${title} description` },
        body: <div data-testid="registrant-body">{bodyText}</div>,
      }
    : null

  useRegisterContextPanel(slot)
  return null
}

// Generic fallback content (context-panel-content.tsx) renders this section
// title unconditionally when no slot is registered — used as the marker
// for "restored to generic panel" in these tests.
const GENERIC_FALLBACK_MARKER = "Dashboard"

function DesktopHarness() {
  return (
    <DesktopContextPanel collapsed={false} onCollapse={() => {}} onExpand={() => {}} />
  )
}

function MobileHarness() {
  return <ContextPanelSheet open onOpenChange={() => {}} />
}

describe("context panel slot", () => {
  it("registers a route's content into the desktop panel", () => {
    render(
      <ContextPanelSlotProvider>
        <Registrant title="Document" bodyText="Outline for doc-1" />
        <DesktopHarness />
      </ContextPanelSlotProvider>
    )

    expect(screen.getByText("Document")).toBeInTheDocument()
    expect(screen.getByText("Outline for doc-1")).toBeInTheDocument()
    expect(screen.queryByText(GENERIC_FALLBACK_MARKER)).not.toBeInTheDocument()
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

  it("shows the generic panel by default when nothing has registered", () => {
    render(
      <ContextPanelSlotProvider>
        <DesktopHarness />
      </ContextPanelSlotProvider>
    )

    expect(screen.getByText(GENERIC_FALLBACK_MARKER)).toBeInTheDocument()
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
