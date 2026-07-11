import { useToastStore } from "./store"
import type { ToastOptions } from "./types"

type QuickToastOptions = Omit<ToastOptions, "message" | "intent">

export function useToast() {
  const show = useToastStore((state) => state.show)
  const dismiss = useToastStore((state) => state.dismiss)
  const dismissAll = useToastStore((state) => state.dismissAll)

  return {
    show,
    dismiss,
    dismissAll,
    neutral: (message: string, options?: QuickToastOptions) =>
      show({ ...options, message, intent: "neutral" }),
    success: (message: string, options?: QuickToastOptions) =>
      show({ ...options, message, intent: "accent" }),
    error: (message: string, options?: QuickToastOptions) =>
      show({ ...options, message, intent: "destructive" }),
    info: (message: string, options?: QuickToastOptions) =>
      show({ ...options, message, intent: "primary" }),
  }
}
