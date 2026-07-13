"use client"

import * as React from "react"
import type { EditorState, LexicalEditor } from "lexical"
import { useToast } from "@workspace/feedback"

import { useRegisterContextPanel } from "@/components/context-panel"
import { ActiveEditorScope } from "@/modules/documents/editor/active-editor-context"
import {
  areMetricsEqual,
  deriveMetrics,
  type DocumentMetrics,
} from "@/modules/documents/editor/derive-metrics"
import {
  areOutlinesEqual,
  deriveOutline,
  type OutlineEntry,
} from "@/modules/documents/editor/derive-outline"
import {
  DocumentLexicalEditor,
  type DocumentBlockType,
} from "@/modules/documents/editor/document-lexical-editor"
import {
  createSaveCoordinator,
  type SaveCoordinator,
  type SaveCoordinatorStatus,
} from "@/modules/documents/editor/save-coordinator"
import {
  createPersistenceSnapshot,
  type PersistenceSnapshot,
} from "@/modules/documents/editor/serialization"
import { updateDocument } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

import {
  DocumentContextPanel,
  type DocumentContextSectionId,
} from "./document-context-panel"
import {
  deriveProperties,
  deriveRelatedDocuments,
} from "./document-context-panel-data"
import { DocumentEditorSurface } from "./document-editor-surface"
import { DocumentHeader } from "./document-header"
import { DocumentRuler } from "./document-ruler-header"
import { DocumentSpine, DocumentSpineHeader } from "./document-spine"
import type { DocumentSaveState } from "./document-status"
import { DocumentStatusBar } from "./document-status-bar"
import { DocumentToolbar } from "./document-toolbar"
import { useDocumentPreference } from "./use-document-preference"

interface DocumentWorkspaceProps {
  documentId: string
  initialDocument?: DocumentRecord | null
}

interface WorkspaceSnapshot {
  title: string
  editor: PersistenceSnapshot | null
}

interface LiveWorkspaceSnapshot {
  title: string
  editorState: EditorState | null
  savedResetTimer: number | null
}

const DEFAULT_ZOOM_PERCENT = 100
const MIN_ZOOM_PERCENT = 70
const MAX_ZOOM_PERCENT = 150
const ZOOM_STEP_PERCENT = 10

const DEFAULT_COLUMN_WIDTH_PX = 720
const MIN_COLUMN_WIDTH_PX = 480
const MAX_COLUMN_WIDTH_PX = 960
const COLUMN_WIDTH_STEP_PX = 60

/**
 * Composes the document page around the Lexical editor (ADR-3):
 *
 * - **Lexical owns live content.** No React state mirrors the document
 *   body; this component keeps only the title, save status, and derived
 *   read models (outline, metrics) recomputed from immutable EditorStates.
 * - **Everything document-scoped lives inside this component**, which
 *   `document-detail.tsx` remounts with `key={documentId}` — so the
 *   composer, save coordinator, active-editor scope, and derived state
 *   can never leak across a document switch.
 * - Persistence goes through the token-sequenced save coordinator;
 *   genuine-edit detection is defined in `editor/content-update.ts`.
 *   Legacy documents are hydrated read-side only and migrate to the
 *   envelope format on the first save a real user edit causes — never
 *   from merely being opened.
 */
export function DocumentWorkspace({
  documentId,
  initialDocument,
}: DocumentWorkspaceProps) {
  const toast = useToast()

  const [document, setDocument] = React.useState(initialDocument ?? null)
  const [title, setTitle] = React.useState(
    initialDocument?.title ?? "Untitled document"
  )
  const [saveState, setSaveState] = React.useState<DocumentSaveState>("clean")
  const [saveError, setSaveError] = React.useState<string>()
  const [outline, setOutline] = React.useState<OutlineEntry[]>([])
  const [contextSection, setContextSection] =
    React.useState<DocumentContextSectionId>("outline")
  const [metrics, setMetrics] = React.useState<DocumentMetrics>({
    words: 0,
    characters: 0,
  })
  const [blockType, setBlockType] = React.useState<DocumentBlockType>("Paragraph")
  const [zoomPercent, setZoomPercent] = useDocumentPreference({
    documentId,
    key: "zoom",
    defaultValue: DEFAULT_ZOOM_PERCENT,
    min: MIN_ZOOM_PERCENT,
    max: MAX_ZOOM_PERCENT,
  })
  const [columnWidthPx, setColumnWidthPx] = useDocumentPreference({
    documentId,
    key: "column-width",
    defaultValue: DEFAULT_COLUMN_WIDTH_PX,
    min: MIN_COLUMN_WIDTH_PX,
    max: MAX_COLUMN_WIDTH_PX,
  })
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null)
  const [isEditorFocused, setIsEditorFocused] = React.useState(false)
  const [isReadOnly, setIsReadOnly] = React.useState(false)
  const [activeEditor, setActiveEditor] = React.useState<LexicalEditor | null>(
    null
  )
  const workspaceRef = React.useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(window.document.fullscreenElement === workspaceRef.current)
    }
    window.document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      window.document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      )
  }, [])

  const toggleFullscreen = React.useCallback(() => {
    if (window.document.fullscreenElement) {
      void window.document.exitFullscreen()
    } else {
      void workspaceRef.current?.requestFullscreen()
    }
  }, [])

  // The editor instance is imperative UI state, so consumers read it from a
  // ref without causing workspace renders.
  const activeEditorRef = React.useRef<LexicalEditor | null>(null)
  const toastRef = React.useRef(toast)
  React.useEffect(() => {
    toastRef.current = toast
  })

  // Persistence inputs are imperative snapshots used only by effects and
  // event handlers. They are intentionally refs rather than React state:
  // mutating them must not render, while the visible title/status continue
  // to use their dedicated state setters above.
  const liveSnapshotRef = React.useRef<LiveWorkspaceSnapshot>({
    title,
    editorState: null,
    savedResetTimer: null,
  })
  const coordinatorRef = React.useRef<SaveCoordinator | null>(null)

  React.useEffect(() => {
    const liveSnapshot = liveSnapshotRef.current

    const persistSnapshot = (snapshot: WorkspaceSnapshot) => {
      const next = updateDocument(
        documentId,
        snapshot.editor
          ? {
              title: snapshot.title,
              content: snapshot.editor.content,
              plainText: snapshot.editor.plainText,
            }
          : { title: snapshot.title }
      )
      if (next) {
        setDocument(next)
      }
      return next
    }

    const handleStatus = (status: SaveCoordinatorStatus) => {
      if (liveSnapshot.savedResetTimer !== null) {
        window.clearTimeout(liveSnapshot.savedResetTimer)
        liveSnapshot.savedResetTimer = null
      }

      switch (status.phase) {
        case "dirty":
          setSaveState("dirty")
          setSaveError(undefined)
          break
        case "saving":
          setSaveState("saving")
          setSaveError(undefined)
          break
        case "saved":
          setSaveState("saved")
          setSaveError(undefined)
          setLastSavedAt(status.savedAt)
          liveSnapshot.savedResetTimer = window.setTimeout(
            () => setSaveState("clean"),
            1500
          )
          break
        case "error":
          setSaveState("error")
          setSaveError(status.message)
          break
      }
    }

    const coordinator = createSaveCoordinator<WorkspaceSnapshot>({
      getSnapshot: () => ({
        title: liveSnapshot.title,
        editor: liveSnapshot.editorState
          ? createPersistenceSnapshot(liveSnapshot.editorState)
          : null,
      }),
      persist: persistSnapshot,
      persistSync: (snapshot) => {
        if (!persistSnapshot(snapshot)) {
          throw new Error("Save returned an empty document")
        }
      },
      onStatusChange: handleStatus,
    })
    coordinatorRef.current = coordinator

    return () => {
      if (liveSnapshot.savedResetTimer !== null) {
        window.clearTimeout(liveSnapshot.savedResetTimer)
      }

      const error = coordinator.flush()
      coordinator.dispose()
      coordinatorRef.current = null
      if (error) {
        toastRef.current.error(
          `Your latest document changes could not be saved: ${error.message}`
        )
      }
    }
  }, [documentId])

  const handleContentChanged = React.useCallback(
    (editorState: EditorState) => {
      liveSnapshotRef.current.editorState = editorState
      const nextMetrics = deriveMetrics(editorState)
      setMetrics((previous) =>
        areMetricsEqual(previous, nextMetrics) ? previous : nextMetrics
      )
      const nextOutline = deriveOutline(editorState)
      setOutline((previous) =>
        areOutlinesEqual(previous, nextOutline) ? previous : nextOutline
      )
    },
    []
  )

  const handleGenuineEdit = React.useCallback(
    (editorState: EditorState) => {
      liveSnapshotRef.current.editorState = editorState
      coordinatorRef.current?.schedule()
    },
    []
  )

  const handleTitleChange = (value: string) => {
    liveSnapshotRef.current.title = value
    setTitle(value)
    // A real user edit; the coordinator no-ops while paused (read-only).
    coordinatorRef.current?.schedule()
  }

  const handleToggleReadOnly = () => {
    const nextReadOnly = !isReadOnly
    const coordinator = coordinatorRef.current
    if (nextReadOnly) {
      // Entering read-only: pending edits were made while editable, so
      // flush them before pausing rather than dropping the last <600ms.
      const error = coordinator?.flush() ?? null
      if (error) {
        setSaveState("error")
        setSaveError(error.message)
      }
      coordinator?.pause()
    } else {
      coordinator?.resume()
    }
    setIsReadOnly(nextReadOnly)
  }

  const handleEditorChange = React.useCallback(
    (editor: LexicalEditor | null) => {
      activeEditorRef.current = editor
      setActiveEditor(editor)
    },
    []
  )

  const handleSelectOutlineEntry = React.useCallback((entry: OutlineEntry) => {
    activeEditorRef.current
      ?.getElementByKey(entry.nodeKey)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleSelectIntro = React.useCallback(() => {
    const rootElement = activeEditorRef.current?.getRootElement()
    rootElement?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

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

  useRegisterContextPanel({
    header: { title: "Document", description: title || "Untitled document" },
    body: (
      <DocumentContextPanel
        activeSection={contextSection}
        onActiveSectionChange={setContextSection}
        outline={outline}
        properties={properties}
        related={related}
        onSelectOutlineEntry={handleSelectOutlineEntry}
      />
    ),
  })

  return (
    <ActiveEditorScope
      editor={activeEditor}
      onEditorChange={handleEditorChange}
    >
      <div
        ref={workspaceRef}
        className="document-workspace flex min-h-0 flex-1 flex-col gap-6 bg-background"
        style={
          {
            "--editor-zoom": zoomPercent / 100,
            "--editor-max-width": `${columnWidthPx}px`,
          } as React.CSSProperties
        }
      >
        <DocumentHeader
          title={title}
          onTitleChange={handleTitleChange}
          updatedAt={document?.updatedAt ?? new Date().toISOString()}
          saveState={saveState}
          saveError={saveError}
          isCompact={isEditorFocused}
          isReadOnly={isReadOnly}
          onToggleReadOnly={handleToggleReadOnly}
        />

        <DocumentEditorSurface
          document={{ id: documentId, title }}
          isFocused={isEditorFocused}
          isReadOnly={isReadOnly}
          toolbar={<DocumentToolbar isFocused={isEditorFocused} />}
          spineHeader={<DocumentSpineHeader />}
          spineNav={
            <DocumentSpine
              outline={outline}
              onSelectIntro={handleSelectIntro}
              onSelectEntry={handleSelectOutlineEntry}
            />
          }
          ruler={
            <DocumentRuler
              columnWidthPx={columnWidthPx}
              zoom={zoomPercent / 100}
            />
          }
          statusBar={
            <DocumentStatusBar
              words={metrics.words}
              characters={metrics.characters}
              blockType={blockType}
              saved={{ state: saveState, lastSavedAt }}
              column={{
                widthPx: columnWidthPx,
                canDecrease: columnWidthPx > MIN_COLUMN_WIDTH_PX,
                canIncrease: columnWidthPx < MAX_COLUMN_WIDTH_PX,
                onDecrease: () =>
                  setColumnWidthPx(columnWidthPx - COLUMN_WIDTH_STEP_PX),
                onIncrease: () =>
                  setColumnWidthPx(columnWidthPx + COLUMN_WIDTH_STEP_PX),
              }}
              zoom={{
                percent: zoomPercent,
                canDecrease: zoomPercent > MIN_ZOOM_PERCENT,
                canIncrease: zoomPercent < MAX_ZOOM_PERCENT,
                onDecrease: () => setZoomPercent(zoomPercent - ZOOM_STEP_PERCENT),
                onIncrease: () => setZoomPercent(zoomPercent + ZOOM_STEP_PERCENT),
                onReset: () => setZoomPercent(DEFAULT_ZOOM_PERCENT),
              }}
              fullscreen={{
                isFullscreen,
                onToggle: toggleFullscreen,
              }}
            />
          }
          editorSlot={
            <DocumentLexicalEditor
              initialContent={initialDocument?.content ?? ""}
              readOnly={isReadOnly}
              onFocus={() => setIsEditorFocused(true)}
              onBlur={() => setIsEditorFocused(false)}
              onContentChanged={handleContentChanged}
              onGenuineEdit={handleGenuineEdit}
              onBlockTypeChanged={setBlockType}
            />
          }
        />
      </div>
    </ActiveEditorScope>
  )
}
