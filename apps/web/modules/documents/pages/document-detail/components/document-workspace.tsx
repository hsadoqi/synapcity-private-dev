"use client"

import * as React from "react"
import { ListTree } from "lucide-react"

import { useRegisterContextPanel } from "@/components/context-panel"
import { updateDocument } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

import { DocumentContextPanel } from "./document-context-panel"
import {
  deriveOutline,
  deriveProperties,
  deriveRelatedDocuments,
  type OutlineEntry,
} from "./document-context-panel-data"
import {
  DocumentEditorPlaceholder,
  type DocumentEditorPlaceholderHandle,
} from "./document-editor-placeholder"
import { DocumentEditorSurface } from "./document-editor-surface"
import { DocumentHeader } from "./document-header"
import type { DocumentSaveState } from "./document-status"
import { DocumentToolbar } from "./document-toolbar"

interface DocumentWorkspaceProps {
  documentId: string
  initialDocument?: DocumentRecord | null
}

function countWords(plainText: string) {
  const trimmed = plainText.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

/**
 * Composes the document page: owns prototype title/content/save-state and
 * the read-only toggle, renders the header + editor surface, and registers
 * this document's context-panel content for as long as the page is
 * mounted. Persistence, editor internals, and block-level state are
 * explicitly out of scope here — see `DocumentEditorPlaceholder` for the
 * Lexical integration seam.
 */
export function DocumentWorkspace({
  documentId,
  initialDocument,
}: DocumentWorkspaceProps) {
  const [document, setDocument] = React.useState(initialDocument ?? null)
  const [title, setTitle] = React.useState(
    initialDocument?.title ?? "Untitled document"
  )
  const [content, setContent] = React.useState(initialDocument?.content ?? "")
  const [saveState, setSaveState] = React.useState<DocumentSaveState>("clean")
  const [saveError, setSaveError] = React.useState<string>()
  const [isEditorFocused, setIsEditorFocused] = React.useState(false)
  const [isReadOnly, setIsReadOnly] = React.useState(false)
  const editorRef = React.useRef<DocumentEditorPlaceholderHandle>(null)

  const isDirty = Boolean(
    document && (title !== document.title || content !== document.content)
  )

  const displayState: DocumentSaveState =
    saveState === "saving" || saveState === "saved" || saveState === "error"
      ? saveState
      : isDirty
        ? "dirty"
        : "clean"

  // ---------------------------------------------------------------------
  // Autosave — what this genuinely does, and what it doesn't.
  //
  // THIS IS PROTOTYPE PERSISTENCE, NOT THE APPROVED EDITOR PERSISTENCE
  // DESIGN. It exists to make the current textarea-based workspace
  // prototype usable (survive a refresh, show a real save-state pill) —
  // nothing more. Specifically, this implementation:
  //   - writes through the existing localStorage-backed `document-data.ts`
  //     service, not the planned IndexedDB persistence adapter;
  //   - has no persisted compare-and-swap revision (nothing here detects
  //     "someone else's save landed since I last read this document");
  //   - has no cross-browser-tab stale-write recovery (two tabs editing the
  //     same document will silently clobber each other, last-write-wins,
  //     with no conflict surfaced to either tab);
  //   - has no application-level save coordinator (no request sequencing,
  //     no retry policy, no queued-write ordering beyond the single-timer
  //     debounce described below).
  // All of the above is expected to be replaced wholesale during the
  // Lexical editor milestone, when persistence moves to the real adapter
  // and gets a proper save coordinator. Do not treat anything below as
  // satisfying the Lexical persistence specification — it satisfies only
  // "the prototype shouldn't lose your typing while you're looking at it."
  //
  // WHERE IT WRITES: through the existing `document-data.ts` service
  // (`updateDocument`), the same one the old form-styled shell used. That
  // service writes to `window.localStorage` under the `synapcity.documents`
  // key. This is real persistence, not a simulation — it survives a page
  // refresh, because it's reading/writing the same localStorage record
  // `loadDocumentById` reads on the next mount.
  //
  // WHAT ESTABLISHES "DIRTY": `document` (React state, below) is the last
  // *successfully saved* snapshot — it only updates inside the try block
  // after `updateDocument` returns a record. `isDirty` compares live
  // `title`/`content` against that snapshot, so "Saved" genuinely means
  // "matches what's in localStorage right now," not "we stopped tracking."
  //
  // CAN SAVE FAIL? Yes, for real, not simulated: `window.localStorage.setItem`
  // throws `QuotaExceededError` if storage is full, and `updateDocument`
  // returns `null` if the document record has been removed from storage out
  // from under us (e.g. deleted in another tab). Both are caught below and
  // surface as the real "error" state with the real error message — nothing
  // here fabricates a failure for demo purposes.
  //
  // RACE BETWEEN A PENDING SAVE AND A NEW EDIT: the debounce is safe against
  // this by construction, but only because the underlying write is
  // synchronous. Every keystroke re-runs this effect; the cleanup cancels
  // whichever `setTimeout` was still pending before scheduling a new one, so
  // there is only ever one pending write, and it always writes the latest
  // `title`/`content` closed over at the time it fires. If persistence
  // becomes asynchronous (a network-backed Lexical save coordinator), this
  // guarantee disappears — two in-flight saves could resolve out of order
  // and a stale one could overwrite newer content. TODO(lexical-integration):
  // a real coordinator needs sequencing (e.g. a monotonically increasing
  // save token, dropping any response older than the latest request), which
  // this prototype does not implement because it doesn't need to yet.
  //
  // CAN SWITCHING DOCUMENTS LOSE EDITS? This was a real gap found during
  // review: `document-detail.tsx` remounts `DocumentWorkspace` with a fresh
  // `key={documentId}` on navigation, and unmounting mid-debounce used to
  // cancel the pending save outright — silently dropping up to 600ms of
  // edits. The flush-on-unmount effect further below closes that specific
  // gap with a best-effort synchronous write. It does not attempt to block
  // navigation, queue retries, or handle a write failure during teardown
  // (there's no UI left to show an error to at that point) — it's a
  // narrower guarantee than a real save coordinator would give you.
  React.useEffect(() => {
    if (!document || !isDirty || isReadOnly) return

    const timeout = window.setTimeout(() => {
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
          window.setTimeout(() => setSaveState("clean"), 1500)
        } else {
          setSaveState("error")
          setSaveError("Save returned an empty document")
        }
      } catch (error) {
        setSaveState("error")
        setSaveError(error instanceof Error ? error.message : "Unknown error")
      }
    }, 600)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  // Flush-on-unmount: a ref mirrors the latest render's values so the
  // unmount-only cleanup below (which closes over stale state otherwise)
  // can see what the user actually typed, not what was true at mount time.
  // The mirroring itself has to happen in an effect, not inline during
  // render: refs are an escape hatch for effects/handlers, and writing to
  // `.current` during render is a React correctness violation (the render
  // may be discarded/retried without the write ever having "counted").
  // Deliberately no dependency array — this must run after every render so
  // the ref never lags behind the latest committed state.
  const flushStateRef = React.useRef({ document, title, content, isReadOnly })
  React.useEffect(() => {
    flushStateRef.current = { document, title, content, isReadOnly }
  })

  React.useEffect(() => {
    return () => {
      const {
        document: baseline,
        title: latestTitle,
        content: latestContent,
        isReadOnly: readOnly,
      } = flushStateRef.current

      if (!baseline || readOnly) return

      const stillDirty =
        latestTitle !== baseline.title || latestContent !== baseline.content
      if (!stillDirty) return

      try {
        updateDocument(documentId, {
          title: latestTitle,
          content: latestContent,
          plainText: latestContent.replace(/\s+/g, " ").trim(),
        })
      } catch {
        // Best-effort only: there is no mounted UI left to show a failure
        // state to. A real save coordinator should surface this (e.g. via
        // a toast that outlives the page) instead of swallowing it.
      }
    }
  }, [documentId])

  const outline = React.useMemo(() => deriveOutline(content), [content])
  const related = React.useMemo(
    () => deriveRelatedDocuments(documentId),
    [documentId]
  )
  const properties = React.useMemo(
    () =>
      document
        ? deriveProperties(document)
        : deriveProperties({
            id: documentId,
            slug: documentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
    [document, documentId]
  )

  const handleSelectOutlineEntry = React.useCallback(
    (entry: OutlineEntry) => {
      const lineIndex = Number.parseInt(entry.id.replace("heading-", ""), 10)
      if (Number.isNaN(lineIndex)) return

      // Outline entries are recomputed from `content` on every render (see
      // `deriveOutline` above), so in practice an entry can't outlive the
      // line it describes — the panel and the content it targets are
      // always derived from the same value. This clamp is a defensive
      // backstop, not evidence that staleness is expected: it protects
      // `scrollToLine` from an out-of-range index if that invariant is ever
      // broken by a future change, rather than assuming it never will be.
      const maxLineIndex = Math.max(content.split("\n").length - 1, 0)
      const safeLineIndex = Math.min(Math.max(lineIndex, 0), maxLineIndex)

      editorRef.current?.scrollToLine(safeLineIndex)
    },
    [content]
  )

  useRegisterContextPanel({
    header: { title: "Document", description: title || "Untitled document" },
    collapsedIcon: <ListTree />,
    body: (
      <DocumentContextPanel
        outline={outline}
        properties={properties}
        related={related}
        onSelectOutlineEntry={handleSelectOutlineEntry}
      />
    ),
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DocumentHeader
        title={title}
        onTitleChange={setTitle}
        updatedAt={document?.updatedAt ?? new Date().toISOString()}
        wordCount={countWords(content)}
        saveState={displayState}
        saveError={saveError}
        isCompact={isEditorFocused}
        isReadOnly={isReadOnly}
        onToggleReadOnly={() => setIsReadOnly((value) => !value)}
      />

      <DocumentEditorSurface
        document={{ id: documentId, title }}
        isFocused={isEditorFocused}
        isReadOnly={isReadOnly}
        toolbar={
          <DocumentToolbar
            isFocused={isEditorFocused}
            value={content}
            onChange={setContent}
            editorRef={editorRef}
          />
        }
        editorSlot={
          <DocumentEditorPlaceholder
            ref={editorRef}
            value={content}
            onChange={setContent}
            onFocus={() => setIsEditorFocused(true)}
            onBlur={() => setIsEditorFocused(false)}
            readOnly={isReadOnly}
          />
        }
      />
    </div>
  )
}
