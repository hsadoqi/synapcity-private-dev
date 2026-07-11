import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useToastStore } from "./store"

describe("toast store", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.getState().dismissAll()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("adds a toast with sensible defaults", () => {
    const id = useToastStore.getState().show({ message: "Saved" })
    const [toast] = useToastStore.getState().toasts

    expect(toast).toMatchObject({
      id,
      message: "Saved",
      intent: "neutral",
      duration: 5000,
      dismissible: true,
    })
  })

  it("auto-dismisses after the given duration", () => {
    useToastStore.getState().show({ message: "Bye soon", duration: 1000 })
    expect(useToastStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(1000)

    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it("never auto-dismisses when duration is 0", () => {
    useToastStore.getState().show({ message: "Sticks around", duration: 0 })

    vi.advanceTimersByTime(60_000)

    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it("dismiss() clears the pending timer so it can't double-fire", () => {
    const id = useToastStore
      .getState()
      .show({ message: "Manual dismiss", duration: 5000 })

    useToastStore.getState().dismiss(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)

    // If the timer weren't cleared, this would throw or misbehave when it
    // eventually fires against an already-removed toast.
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow()
  })

  it("dismissAll clears every toast and its timers", () => {
    useToastStore.getState().show({ message: "One" })
    useToastStore.getState().show({ message: "Two" })
    expect(useToastStore.getState().toasts).toHaveLength(2)

    useToastStore.getState().dismissAll()

    expect(useToastStore.getState().toasts).toHaveLength(0)
    expect(useToastStore.getState().timers.size).toBe(0)
  })

  it("reusing an id replaces the toast instead of duplicating it", () => {
    useToastStore.getState().show({ id: "save-status", message: "Saving…" })
    useToastStore.getState().show({ id: "save-status", message: "Saved" })

    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0]?.message).toBe("Saved")
  })
})
