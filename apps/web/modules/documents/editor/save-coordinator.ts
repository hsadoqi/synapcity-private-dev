/**
 * Debounced, token-sequenced persistence coordinator (ADR-3).
 *
 * One instance per `DocumentWorkspace` mount; the workspace remounts with
 * `key={documentId}` (document-detail.tsx), so every coordinator is
 * document-scoped by construction — there is deliberately no documentId
 * routing in here.
 *
 * The API is written for the Phase-2 async backend (persist may return a
 * promise) even though today's localStorage write is synchronous. Known,
 * documented limitation carried over from the prototype: no cross-tab
 * compare-and-swap — that needs real revisions from the Phase-2 backend
 * and is not faked here with a local counter.
 */

export type SaveCoordinatorStatus =
  | { phase: "dirty" }
  | { phase: "saving" }
  | { phase: "saved"; savedAt: number }
  | { phase: "error"; message: string }

export interface SaveCoordinatorOptions<TSnapshot> {
  /** Reads the freshest snapshot at write time (call sites keep ref mirrors). */
  getSnapshot: () => TSnapshot
  /** Async-capable write; a `null`ish resolution is treated as failure. */
  persist: (snapshot: TSnapshot) => Promise<unknown> | unknown
  /**
   * Synchronous write used by `flush()` (unmount/navigation, read-only
   * entry). If omitted, flush degrades to fire-and-forget `persist`.
   */
  persistSync?: (snapshot: TSnapshot) => void
  onStatusChange: (status: SaveCoordinatorStatus) => void
  debounceMs?: number
  now?: () => number
}

export interface SaveCoordinator {
  /** Call after every genuine content mutation. No-op while paused/disposed. */
  schedule: () => void
  /**
   * Best-effort synchronous write of any pending work. Returns the error
   * (instead of throwing) so teardown call sites can route it to the
   * global feedback system; returns null when nothing was pending or the
   * write succeeded.
   */
  flush: () => Error | null
  /** Read-only entry: callers flush() first, then pause(). */
  pause: () => void
  resume: () => void
  dispose: () => void
  hasPendingWork: () => boolean
}

export function createSaveCoordinator<TSnapshot>(
  options: SaveCoordinatorOptions<TSnapshot>
): SaveCoordinator {
  const debounceMs = options.debounceMs ?? 600
  const now = options.now ?? Date.now

  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight = false
  let trailingRequested = false
  let paused = false
  let disposed = false

  // Monotonic token: stamped per attempt. Any completion whose token is
  // older than the latest issued is stale and must be discarded — a sync
  // flush or a coalesced retry may have written newer content since.
  let latestToken = 0

  const emit = (status: SaveCoordinatorStatus) => {
    if (!disposed) options.onStatusChange(status)
  }

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const runSave = () => {
    if (disposed || paused) return
    if (inFlight) {
      // Single-flight: coalesce into one trailing save that reads the
      // newest snapshot when the current attempt settles.
      trailingRequested = true
      return
    }

    inFlight = true
    const token = ++latestToken
    emit({ phase: "saving" })

    Promise.resolve()
      .then(() => options.persist(options.getSnapshot()))
      .then(
        (result) => settle(token, result ? null : emptyResultError()),
        (error: unknown) => settle(token, toError(error))
      )
  }

  const settle = (token: number, error: Error | null) => {
    inFlight = false

    // Stale completion: a newer attempt (or a sync flush, which also
    // bumps the token) superseded this one. Its outcome — success or
    // failure — is about content that is no longer the latest write, so
    // it must not drive status. Trailing work still runs.
    const stale = token !== latestToken

    if (!stale) {
      if (error) {
        emit({ phase: "error", message: error.message })
      } else {
        emit({ phase: "saved", savedAt: now() })
      }
    }

    if (trailingRequested) {
      trailingRequested = false
      runSave()
    }
  }

  return {
    schedule: () => {
      if (disposed || paused) return
      clearTimer()
      emit({ phase: "dirty" })
      timer = setTimeout(() => {
        timer = null
        runSave()
      }, debounceMs)
    },

    flush: () => {
      const pending = timer !== null || trailingRequested || inFlight
      clearTimer()
      trailingRequested = false
      if (!pending || disposed) return null

      // Invalidate any in-flight completion — this write is newer.
      latestToken++

      try {
        if (options.persistSync) {
          options.persistSync(options.getSnapshot())
        } else {
          void options.persist(options.getSnapshot())
        }
        return null
      } catch (error) {
        return toError(error)
      }
    },

    pause: () => {
      paused = true
      clearTimer()
    },

    resume: () => {
      paused = false
    },

    dispose: () => {
      disposed = true
      clearTimer()
    },

    hasPendingWork: () => timer !== null || trailingRequested || inFlight,
  }
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function emptyResultError(): Error {
  return new Error("Save returned an empty document")
}
