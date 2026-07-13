import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type DocumentSaveState = "clean" | "dirty" | "saving" | "saved" | "error"

const STATUS_LABEL: Record<DocumentSaveState, string> = {
  clean: "Saved",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
}

const STATUS_TONE: Record<DocumentSaveState, string> = {
  clean: "text-muted-foreground",
  dirty: "text-amber-600 dark:text-amber-400",
  saving: "text-muted-foreground",
  saved: "text-emerald-600 dark:text-emerald-400",
  error: "text-destructive",
}

export function DocumentStatus({
  state,
  error,
  className,
}: {
  state: DocumentSaveState
  error?: string
  className?: string
}) {
  if (state === "clean") return null

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        STATUS_TONE[state],
        className
      )}
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-atomic="true"
    >
      {state === "saving" && (
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
      )}
      {state === "dirty" && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      <span>{STATUS_LABEL[state]}</span>
      {error && state === "error" && (
        <span className="text-muted-foreground">— {error}</span>
      )}
    </div>
  )
}
