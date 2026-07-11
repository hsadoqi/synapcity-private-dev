// Toast intent maps directly onto the design system's real semantic tokens
// (packages/ui/src/styles/globals.css: neutral/primary/accent/destructive).
// There is no success/warning/info token in this system, so we don't invent
// one here — "accent" carries positive/highlight emphasis, "destructive"
// carries error emphasis, and callers can extend via className if a future
// case genuinely needs more granularity than that.
export type ToastIntent = "neutral" | "primary" | "accent" | "destructive"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  id?: string
  message: string
  title?: string
  intent?: ToastIntent
  /** Auto-dismiss time in ms. 0 disables auto-dismiss. */
  duration?: number
  dismissible?: boolean
  action?: ToastAction
}

export interface ToastItem {
  id: string
  message: string
  title?: string
  intent: ToastIntent
  duration: number
  dismissible: boolean
  action?: ToastAction
  createdAt: number
}
