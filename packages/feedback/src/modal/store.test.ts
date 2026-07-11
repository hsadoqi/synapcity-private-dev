import { beforeEach, describe, expect, it, vi } from "vitest"

import { useModalStore } from "./store"

describe("modal store", () => {
  beforeEach(() => {
    useModalStore.setState({ queue: [] })
  })

  it("pushes a request onto the queue and returns its id", () => {
    const resolve = vi.fn()
    const id = useModalStore.getState().push({
      variant: "confirm",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      confirmVariant: "default",
      closeOnBackdrop: true,
      resolve,
    })

    expect(useModalStore.getState().queue).toHaveLength(1)
    expect(useModalStore.getState().queue[0]?.id).toBe(id)
  })

  it("resolve() calls the request's resolver and removes it from the queue", () => {
    const resolve = vi.fn()
    const id = useModalStore.getState().push({
      variant: "confirm",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      confirmVariant: "default",
      closeOnBackdrop: true,
      resolve,
    })

    useModalStore.getState().resolve(id, true)

    expect(resolve).toHaveBeenCalledWith(true)
    expect(useModalStore.getState().queue).toHaveLength(0)
  })

  it("resolving an id twice is a safe no-op the second time", () => {
    const resolve = vi.fn()
    const id = useModalStore.getState().push({
      variant: "alert",
      confirmLabel: "OK",
      confirmVariant: "default",
      closeOnBackdrop: true,
      resolve,
    })

    useModalStore.getState().resolve(id, true)
    useModalStore.getState().resolve(id, false)

    expect(resolve).toHaveBeenCalledTimes(1)
  })

  it("supports multiple queued requests, front-of-queue first", () => {
    const first = useModalStore.getState().push({
      variant: "alert",
      confirmLabel: "OK",
      confirmVariant: "default",
      closeOnBackdrop: true,
      resolve: vi.fn(),
    })
    useModalStore.getState().push({
      variant: "alert",
      confirmLabel: "OK",
      confirmVariant: "default",
      closeOnBackdrop: true,
      resolve: vi.fn(),
    })

    expect(useModalStore.getState().queue).toHaveLength(2)
    expect(useModalStore.getState().queue[0]?.id).toBe(first)
  })
})
