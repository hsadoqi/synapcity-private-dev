"use client"

import * as React from "react"

/**
 * The context panel is shared shell chrome (see AppShell) but its contents
 * should reflect whatever route is active. Rather than teaching the shell
 * about documents, dashboards, etc., a page registers what it wants shown
 * here and the shell just renders the current registration. Nothing is
 * registered by default, so unscoped routes keep the generic workspace nav
 * (see `ContextPanelContent`).
 */
export interface ContextPanelSlotHeader {
  title: string
  description?: string
}

export interface ContextPanelSlot {
  header: ContextPanelSlotHeader
  body: React.ReactNode
}

// Internal only — never exposed outside this module. Pairs a registrant's
// stable identity with the slot content it last published, so cleanup can
// tell "am I still the active registration?" apart from "does my content
// happen to look different now?" (slot objects are recreated every render
// by design, see the comment on `useRegisterContextPanel` below, so they
// can never be used as an identity signal on their own).
interface ContextPanelRegistration {
  id: symbol
  slot: ContextPanelSlot | null
}

type SetContextPanelRegistration = React.Dispatch<
  React.SetStateAction<ContextPanelRegistration | null>
>

// Deliberately two contexts, not one `{ registration, setRegistration }`
// value.
//
// A registrant (e.g. DocumentWorkspace) re-creates its slot object every
// render because its content genuinely changes (title edits, outline
// updates, etc.) — that's expected. If the *setter* were bundled into the
// same context value as the *registration*, every content update would
// produce a new context value, which would re-render every consumer of
// that context — including registrants that only wanted the (normally
// stable) setter. That re-render would recompute their slot object,
// re-firing the registration effect, calling the setter again, and looping
// forever. This happened during implementation and was caught by
// `context-panel-slot.test.tsx` hanging.
//
// Splitting the contexts means `useRegisterContextPanel` only subscribes to
// `SetterContext`, whose value (the raw `useState` setter) never changes
// identity — so registering new content never re-renders the registrant
// itself. Only the actual display consumers (`useContextPanelSlot`, used by
// the desktop panel and mobile sheet) subscribe to the derived slot value,
// and the registration identity (`id`) never leaks out to them at all.
const ContextPanelSlotValueContext =
  React.createContext<ContextPanelSlot | null | undefined>(undefined)
const ContextPanelSlotSetterContext = React.createContext<
  SetContextPanelRegistration | undefined
>(undefined)

export function ContextPanelSlotProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [registration, setRegistration] =
    React.useState<ContextPanelRegistration | null>(null)
  const slot = registration?.slot ?? null

  return (
    <ContextPanelSlotSetterContext.Provider value={setRegistration}>
      <ContextPanelSlotValueContext.Provider value={slot}>
        {children}
      </ContextPanelSlotValueContext.Provider>
    </ContextPanelSlotSetterContext.Provider>
  )
}

/** Consumed by the shared shell (desktop panel + mobile sheet). */
export function useContextPanelSlot() {
  const slot = React.useContext(ContextPanelSlotValueContext)
  if (slot === undefined) {
    throw new Error(
      "useContextPanelSlot must be used within a ContextPanelSlotProvider"
    )
  }
  return slot
}

/**
 * Consumed by a page to publish what the context panel should show while
 * that page is mounted. Content is cleared automatically on unmount so
 * navigating away restores the generic workspace nav.
 *
 * REGISTRATION INVARIANT: the intended normal case is exactly one active
 * route/workspace registration at a time. Only one document or dashboard
 * route is ever mounted at once under normal routing, so in practice a
 * single component calls this hook with a non-null slot for the lifetime
 * of that route. Everything below describes what happens outside that
 * normal case — it is a documented fallback, not an invitation for
 * unrelated components to compete for the slot. Overlapping registrations
 * remain an exceptional override pattern, not the normal composition
 * model — if it happens outside tests, treat it as a routing bug, not a
 * supported way to layer panel content.
 *
 * "LAST COMMITTED WINS": the active registration is a single value backed
 * by one `useState` in the provider, not a stack. If two components hold a
 * registration at the same time, effects run in commit order, so whichever
 * one's effect commits last determines the active slot.
 *
 * CLEANUP IS REGISTRATION-IDENTITY-AWARE. Each call to this hook gets its
 * own stable identity — a `symbol` created once per hook instance (see
 * `registrationIdRef` below) and held for that instance's entire mounted
 * lifetime, independent of how many times its slot content changes.
 * Cleanup only ever clears the shared registration when
 * `current?.id === <this instance's id>`; if some other, newer
 * registration has since taken over, the check fails and cleanup is a
 * no-op. Concretely:
 *
 *   1. Registration A mounts and becomes active.
 *   2. Registration B mounts later and becomes active (last-committed-wins).
 *   3. Registration A unmounts — its cleanup sees `current.id !== A.id`
 *      (B owns the slot now) and does nothing.
 *   4. Registration B remains active.
 *   5. Registration B unmounts — its cleanup sees `current.id === B.id`
 *      and clears the slot.
 *   6. The panel falls back to the generic content.
 *
 * An older registration can never clear a newer active registration. This
 * is verified by `context-panel-slot.test.tsx`.
 */
export function useRegisterContextPanel(slot: ContextPanelSlot | null) {
  const setRegistration = React.useContext(ContextPanelSlotSetterContext)
  if (!setRegistration) {
    throw new Error(
      "useRegisterContextPanel must be used within a ContextPanelSlotProvider"
    )
  }

  // Stable per-hook-instance identity, assigned once and reused for as
  // long as this component instance stays mounted — regardless of how
  // many times `slot` itself changes identity across re-renders. `useRef`
  // has no lazy-initializer argument (unlike `useState`), so the
  // "assign only if still unset" check is the standard idiom for a
  // computed-once ref value.
  const registrationIdRef = React.useRef<symbol | null>(null)
  if (registrationIdRef.current === null) {
    registrationIdRef.current = Symbol("context-panel-registration")
  }

  React.useEffect(() => {
    const id = registrationIdRef.current!
    setRegistration({ id, slot })

    return () => {
      // Identity-aware clear: only drop the shared registration if it is
      // still this exact one. A stale registration — whether from an
      // older mount that's unmounting late, or from the previous commit
      // of this same hook right before it re-registers updated content —
      // must never be able to clobber whatever is currently active.
      setRegistration((current) => (current?.id === id ? null : current))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot])
}
