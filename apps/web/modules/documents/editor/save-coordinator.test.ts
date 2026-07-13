import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createSaveCoordinator,
  type SaveCoordinatorStatus,
} from "./save-coordinator"

interface Deferred {
  promise: Promise<unknown>
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

function deferred(): Deferred {
  let resolve!: (value?: unknown) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function createHarness(overrides?: {
  persist?: (snapshot: string) => Promise<unknown> | unknown
  persistSync?: (snapshot: string) => void
}) {
  let snapshot = "v1"
  const statuses: SaveCoordinatorStatus[] = []
  const persist = vi.fn(overrides?.persist ?? (() => ({ saved: true })))
  const persistSync = overrides?.persistSync
    ? vi.fn(overrides.persistSync)
    : vi.fn()

  const coordinator = createSaveCoordinator<string>({
    getSnapshot: () => snapshot,
    persist,
    persistSync,
    onStatusChange: (status) => statuses.push(status),
    now: () => 1234,
  })

  return {
    coordinator,
    persist,
    persistSync,
    statuses,
    setSnapshot: (value: string) => {
      snapshot = value
    },
  }
}

const phases = (statuses: SaveCoordinatorStatus[]) =>
  statuses.map((status) => status.phase)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("createSaveCoordinator", () => {
  it("debounces rapid schedules into one save of the freshest snapshot", async () => {
    const harness = createHarness()

    harness.coordinator.schedule()
    harness.setSnapshot("v2")
    await vi.advanceTimersByTimeAsync(300)
    harness.coordinator.schedule()
    harness.setSnapshot("v3")
    harness.coordinator.schedule()

    await vi.advanceTimersByTimeAsync(600)

    expect(harness.persist).toHaveBeenCalledTimes(1)
    expect(harness.persist).toHaveBeenCalledWith("v3")
    expect(phases(harness.statuses)).toEqual([
      "dirty",
      "dirty",
      "dirty",
      "saving",
      "saved",
    ])
    const saved = harness.statuses.at(-1)
    expect(saved).toEqual({ phase: "saved", savedAt: 1234 })
  })

  it("reports persist rejections as error status", async () => {
    const harness = createHarness({
      persist: () => Promise.reject(new Error("quota exceeded")),
    })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600)

    expect(harness.statuses.at(-1)).toEqual({
      phase: "error",
      message: "quota exceeded",
    })
  })

  it("treats a nullish persist result as a failed save", async () => {
    const harness = createHarness({ persist: () => null })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600)

    expect(harness.statuses.at(-1)).toEqual({
      phase: "error",
      message: "Save returned an empty document",
    })
  })

  it("coalesces schedules that land mid-flight into one trailing save", async () => {
    const first = deferred()
    let call = 0
    const harness = createHarness({
      persist: () => {
        call += 1
        return call === 1 ? first.promise : { saved: true }
      },
    })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600) // save #1 in flight

    harness.setSnapshot("v2")
    harness.coordinator.schedule()
    harness.setSnapshot("v3")
    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600) // debounce fires mid-flight → trailing

    expect(harness.persist).toHaveBeenCalledTimes(1) // still only #1

    first.resolve({ saved: true })
    await vi.advanceTimersByTimeAsync(0)

    expect(harness.persist).toHaveBeenCalledTimes(2)
    expect(harness.persist).toHaveBeenLastCalledWith("v3")
  })

  it("discards stale completions superseded by a sync flush", async () => {
    const slow = deferred()
    const harness = createHarness({ persist: () => slow.promise })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600) // async save in flight

    harness.setSnapshot("v2")
    // A newer synchronous write (e.g. teardown flush) supersedes it…
    expect(harness.coordinator.flush()).toBeNull()
    expect(harness.persistSync).toHaveBeenCalledWith("v2")

    const statusCountBeforeStaleResolve = harness.statuses.length
    slow.resolve({ saved: true }) // …so this completion is stale
    await vi.advanceTimersByTimeAsync(0)

    expect(harness.statuses.length).toBe(statusCountBeforeStaleResolve)
    expect(phases(harness.statuses)).not.toContain("saved")
  })

  it("discards stale failures the same way", async () => {
    const slow = deferred()
    const harness = createHarness({ persist: () => slow.promise })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600)
    harness.coordinator.flush()

    slow.reject(new Error("stale failure"))
    await vi.advanceTimersByTimeAsync(0)

    expect(phases(harness.statuses)).not.toContain("error")
  })

  it("flush is a no-op without pending work", () => {
    const harness = createHarness()

    expect(harness.coordinator.flush()).toBeNull()
    expect(harness.persist).not.toHaveBeenCalled()
    expect(harness.persistSync).not.toHaveBeenCalled()
  })

  it("flush returns (not throws) the sync-write failure", async () => {
    const harness = createHarness({
      persistSync: () => {
        throw new Error("storage full")
      },
    })

    harness.coordinator.schedule()
    const error = harness.coordinator.flush()

    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toBe("storage full")
  })

  it("ignores schedule while paused and resumes cleanly", async () => {
    const harness = createHarness()

    harness.coordinator.pause()
    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(1200)

    expect(harness.persist).not.toHaveBeenCalled()
    expect(harness.statuses).toEqual([]) // not even "dirty"

    harness.coordinator.resume()
    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600)

    expect(harness.persist).toHaveBeenCalledTimes(1)
  })

  it("does nothing after dispose, including late completions", async () => {
    const slow = deferred()
    const harness = createHarness({ persist: () => slow.promise })

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(600)
    harness.coordinator.dispose()

    harness.coordinator.schedule()
    await vi.advanceTimersByTimeAsync(1200)
    expect(harness.persist).toHaveBeenCalledTimes(1)

    const statusCount = harness.statuses.length
    slow.resolve({ saved: true })
    await vi.advanceTimersByTimeAsync(0)
    expect(harness.statuses.length).toBe(statusCount)
  })
})
