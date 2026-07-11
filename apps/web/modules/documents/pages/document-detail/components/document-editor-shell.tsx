"use client"

import * as React from "react"

import { updateDocument } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

interface DocumentEditorShellProps {
  documentId: string
  initialDocument?: DocumentRecord | null
}

const EditorHeader = ({ onSave }: { onSave: () => void }) => {
  const content = (classes: string) => (
    <p className={cn("mt-1", classes)}>
      Edit the current document content and keep a local draft in sync with the
      route state.
    </p>
  )
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
      <button
        type="button"
        onClick={onSave}
        className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition hover:border-primary"
      >
        Save
      </button>
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

  const handleSave = () => {
    if (!document) {
      return
    }

    const nextDocument = updateDocument(documentId, {
      title,
      content,
      plainText: content.replace(/\s+/g, " ").trim(),
    })

    if (nextDocument) {
      setDocument(nextDocument)
    }
  }


return (
  <div className="flex flex-1 flex-col rounded-xl border border-border bg-background/70 p-6 shadow-sm">
    <EditorHeader onSave={handleSave} />

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
