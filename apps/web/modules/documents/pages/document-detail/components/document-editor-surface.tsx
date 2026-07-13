"use client"

import * as React from "react"
import { Eye } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import type { DocumentRecord } from "@/modules/documents/types"

interface DocumentEditorSurfaceProps {
  document: Pick<DocumentRecord, "id" | "title">
  /**
   * The seam: whatever renders the actual writing surface. Today this is
   * `DocumentEditorPlaceholder` (a styled textarea). The real Lexical
   * editor drops in here without this component changing — it only cares
   * about layout, focus chrome, and read-only presentation.
   */
  editorSlot: React.ReactNode
  toolbar?: React.ReactNode
  isFocused: boolean
  isReadOnly: boolean
  className?: string
}

/**
 * Owns the canvas chrome: readable width, quiet bordered surface, toolbar
 * placement, and focus/read-only presentation. Deliberately knows nothing
 * about editor internals — everything content-related arrives through
 * `editorSlot`.
 */
export function DocumentEditorSurface({
  document,
  editorSlot,
  toolbar,
  isFocused,
  isReadOnly,
  className,
}: DocumentEditorSurfaceProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col rounded-xl border bg-card transition-colors duration-200 ease-out",
        isFocused ? "border-ring/60" : "border-border",
        className
      )}
      data-document-id={document.id}
    >
      {isReadOnly && (
        <div className="flex items-center gap-2 rounded-t-xl border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <Eye className="size-3.5" aria-hidden="true" />
          Viewing only. Switch to editing to make changes.
        </div>
      )}

      {toolbar && !isReadOnly && toolbar}

      <div className="mx-auto w-full max-w-[68ch] flex-1 px-6 py-8 md:px-10 md:py-10">
        <div aria-disabled={isReadOnly} className={cn(isReadOnly && "opacity-70")}>
          {editorSlot}
        </div>
      </div>
    </div>
  )
}
