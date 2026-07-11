"use client"

import * as React from "react"

import { updateDocument } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"
import { Info, Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Button,
} from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

interface DocumentEditorShellProps {
  documentId: string
  initialDocument?: DocumentRecord | null
}

type SaveState = "clean" | "dirty" | "saving" | "saved" | "error"

const EditorHeader = ({
  onSave,
  saveState,
  saveError,
}: {
  onSave: () => void
  saveState: SaveState
  saveError?: string
}) => {
  const content = (classes: string) => (
    <p className={cn("mt-1", classes)}>
      Edit the current document content and keep a local draft in sync with the
      route state.
    </p>
  )

  const isSaving = saveState === "saving"
  const isDirty = saveState === "dirty"

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2 md:flex-col">
        <h2 className="text-lg font-medium">Editor shell</h2>
        <Tooltip>
          <TooltipTrigger>
            <Info className="size-4 text-muted-foreground opacity-50 hover:opacity-100 md:hidden" />
          </TooltipTrigger>
          <TooltipContent>{content("text-xs text-background")}</TooltipContent>
        </Tooltip>
        <span className="hidden md:block">
          {content("text-sm text-muted-foreground")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <SaveStatus saveState={saveState} error={saveError} />
        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          aria-busy={isSaving}
          variant="outline"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  )
}

const SaveStatus = ({ saveState, error }: { saveState: SaveState; error?: string }) => {
  const messages: Record<SaveState, string> = {
    clean: "",
    dirty: "Unsaved changes",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  }

  const message = messages[saveState]

  if (!message) return null

  return (
    <div
      className={cn(
        "text-xs font-medium",
        saveState === "dirty" && "text-amber-600 dark:text-amber-400",
        saveState === "saving" && "text-blue-600 dark:text-blue-400",
        saveState === "saved" && "text-green-600 dark:text-green-400",
        saveState === "error" && "text-red-600 dark:text-red-400"
      )}
      role={saveState === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
      {error && <div className="text-xs text-muted-foreground">{error}</div>}
    </div>
  )
}

export function DocumentEditorShell({
  documentId,
  initialDocument,
}: DocumentEditorShellProps) {
  const [document, setDocument] = React.useState(initialDocument ?? null)
  const [title, setTitle] = React.useState(
    initialDocument?.title ?? "Untitled document"
  )
  const [content, setContent] = React.useState(initialDocument?.content ?? "")
  const [saveState, setSaveState] = React.useState<SaveState>("clean")
  const [saveError, setSaveError] = React.useState<string>()

  // Track if current content differs from saved document
  const isDirty = React.useMemo(
    () =>
      document &&
      (title !== document.title || content !== document.content),
    [document, title, content]
  )

  const handleSave = () => {
    if (!document || !isDirty || saveState === "saving") {
      return
    }

    setSaveState("saving")
    setSaveError(undefined)

    try {
      const nextDocument = updateDocument(documentId, {
        title,
        content,
        plainText: content.replace(/\s+/g, " ").trim(),
      })

      if (nextDocument) {
        setDocument(nextDocument)
        setSaveState("saved")

        // Auto-clear saved state after 2 seconds
        setTimeout(() => {
          setSaveState("clean")
        }, 2000)
      } else {
        setSaveState("error")
        setSaveError("Save returned empty document")
      }
    } catch (error) {
      setSaveState("error")
      setSaveError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  // Determine display state based on isDirty and saveState
  const displayState: SaveState = React.useMemo(() => {
    if (saveState === "saving" || saveState === "saved" || saveState === "error") {
      return saveState
    }
    return isDirty ? "dirty" : "clean"
  }, [saveState, isDirty])

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-background/70 p-6 shadow-sm">
      <EditorHeader onSave={handleSave} saveState={displayState} saveError={saveError} />

      <div className="mt-6 flex flex-1 flex-col space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-1 flex-col space-y-4">
          <span className="text-sm font-medium">Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
    </div>
  )
}
