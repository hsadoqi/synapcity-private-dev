import { useModalStore } from "./store"
import type { AlertOptions, ConfirmOptions } from "./types"

// A confirm()/alert() that never resolves (component unmounted before the
// user acted, browser tab backgrounded indefinitely, etc.) leaks a pending
// promise. Auto-resolving after a timeout bounds that — same defensive
// behavior as the synapcity-monorepo reference implementation.
const AUTO_TIMEOUT_MS = 30_000

export function useModal() {
  const push = useModalStore((state) => state.push)
  const resolveInStore = useModalStore((state) => state.resolve)

  const closeAll = () => {
    for (const request of useModalStore.getState().queue) {
      request.resolve(false)
    }
    useModalStore.setState({ queue: [] })
  }

  const confirm = (options: ConfirmOptions) =>
    new Promise<boolean>((resolvePromise) => {
      const id = push({
        variant: "confirm",
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        confirmVariant: options.confirmVariant ?? "default",
        closeOnBackdrop: options.closeOnBackdrop ?? true,
        resolve: resolvePromise,
      })

      setTimeout(() => resolveInStore(id, false), AUTO_TIMEOUT_MS)
    })

  const alert = (options: AlertOptions) =>
    new Promise<void>((resolvePromise) => {
      const id = push({
        variant: "alert",
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? "OK",
        confirmVariant: "default",
        closeOnBackdrop: true,
        resolve: () => resolvePromise(),
      })

      setTimeout(() => resolveInStore(id, true), AUTO_TIMEOUT_MS)
    })

  return { confirm, alert, closeAll }
}
