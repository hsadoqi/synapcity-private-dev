"use client"

import { XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/primitives/button"
import { cn } from "@workspace/ui/lib/utils"

import { useToastStore } from "./store"
import type { ToastIntent } from "./types"

const INTENT_STYLES: Record<ToastIntent, string> = {
  neutral: "ring-foreground/10",
  primary: "ring-primary/30 bg-primary/5",
  accent: "ring-accent-500/30 bg-accent-50 dark:bg-accent-950/40",
  destructive: "ring-destructive/30 bg-destructive/5",
}

/**
 * Mount once near the root of the app (see app/root-providers.tsx). Renders
 * the live toast stack; useToast() is how the rest of the app pushes into
 * it. Fixed positioning rather than a portal library — this is a single
 * top-level region, not nested overlays, so React portals buy nothing here.
 */
export function ToastRenderer() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-2 rounded-none bg-popover p-3 text-xs/relaxed text-popover-foreground ring-1 duration-100 animate-in fade-in-0 slide-in-from-bottom-2",
            INTENT_STYLES[toast.intent]
          )}
        >
          <div className="flex-1 space-y-0.5">
            {toast.title ? (
              <p className="font-heading text-xs font-medium">
                {toast.title}
              </p>
            ) : null}
            <p>{toast.message}</p>
            {toast.action ? (
              <button
                type="button"
                onClick={toast.action.onClick}
                className="text-xs font-medium underline underline-offset-2 hover:no-underline"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
          {toast.dismissible ? (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
