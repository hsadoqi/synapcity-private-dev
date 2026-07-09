"use client"

import * as React from "react"

import { updateDocument } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

interface DocumentEditorShellProps {
  documentId: string
  initialDocument?: DocumentRecord | null
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
    <div className="rounded-xl border border-border bg-background/70 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Editor shell</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit the current document content and keep a local draft in sync
            with the route state.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition hover:border-primary"
        >
          Save
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
    </div>
  )
}
