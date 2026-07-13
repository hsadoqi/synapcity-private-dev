"use client"


import * as React from "react"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import type { InitialConfigType } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text"
import { $isListNode } from "@lexical/list"

import { useSetActiveEditor } from "./active-editor-context"
import {
  attachDocumentEditorSync,
  SYNAPCITY_HYDRATION_TAG,
} from "./content-update"
import { EDITOR_NODES } from "./editor-nodes"
import { EDITOR_THEME } from "./editor-theme"
import { EDITOR_TRANSFORMERS } from "./editor-transformers"
import { parseDocumentContent } from "./serialization"
import "./editor-content.css"

export type DocumentBlockType =
  | "Paragraph"
  | "Heading 1"
  | "Heading 2"
  | "Heading 3"
  | "Quote"
  | "Bulleted list"
  | "Numbered list"
  | "Checklist"

export interface DocumentLexicalEditorProps {
  /**
   * Raw `DocumentRecord.content` captured at mount. Envelope or legacy
   * markdown — `parseDocumentContent` decides; the component never
   * rehydrates after init (a document switch remounts the whole
   * workspace via `key={documentId}`).
   */
  initialContent: string
  readOnly: boolean
  onFocus?: () => void
  onBlur?: () => void
  /** See `DocumentEditorSyncCallbacks` — initial hydrated state + every genuine edit. */
  onContentChanged: (editorState: EditorState) => void
  /** Genuine user edits only (drives the save coordinator). */
  onGenuineEdit: (editorState: EditorState) => void
  onBlockTypeChanged?: (blockType: DocumentBlockType) => void
}

/**
 * The real editor at the `DocumentEditorSurface.editorSlot` seam,
 * replacing `DocumentEditorPlaceholder`. Owns live editor state (ADR-3);
 * everything the workspace needs flows out through the two content
 * callbacks and the active-editor context — no value/onChange mirroring.
 */
export function DocumentLexicalEditor({
  initialContent,
  readOnly,
  onFocus,
  onBlur,
  onContentChanged,
  onGenuineEdit,
  onBlockTypeChanged,
}: DocumentLexicalEditorProps) {
  // Config is computed once per mount; content hydration is NOT delegated
  // to Lexical's `editorState` init option. That path defers the actual
  // commit until the composer's internal effects flush, which can coalesce
  // with a synchronous update issued in the same tick (e.g. a user typing
  // immediately on open) into a single merged commit — losing the
  // hydration tag's exclusivity and silently swallowing that first genuine
  // edit. `HydrationPlugin` below owns hydration explicitly instead: one
  // controlled, immediately-flushed write tagged `SYNAPCITY_HYDRATION_TAG`,
  // so nothing can ever merge into it — see content-update.ts.
  const [initialConfig] = React.useState<InitialConfigType>(() => ({
    namespace: "synapcity-document",
    nodes: EDITOR_NODES,
    theme: EDITOR_THEME,
    editable: !readOnly,
    onError: (error: Error) => {
      throw error
    },
  }))

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-content"
              aria-label="Document content"
              aria-placeholder="Start writing…"
              placeholder={
                <div className="editor-placeholder absolute top-0 left-0">
                  Start writing…
                </div>
              }
              onFocus={onFocus}
              onBlur={onBlur}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={EDITOR_TRANSFORMERS} />
      <HydrationPlugin initialContent={initialContent} />
      <EditableSyncPlugin readOnly={readOnly} />
      <EditorSyncPlugin
        onContentChanged={onContentChanged}
        onGenuineEdit={onGenuineEdit}
      />
      <ActiveEditorBridgePlugin />
      {onBlockTypeChanged && (
        <BlockTypePlugin onBlockTypeChanged={onBlockTypeChanged} />
      )}
    </LexicalComposer>
  )
}

/**
 * Owns the one-time hydration write (ADR-3). Runs before `EditorSyncPlugin`
 * registers its listener so hydration is never observed as a "no listener
 * yet" case, and flushes synchronously (`discrete: true` / `setEditorState`
 * commits immediately) so no later update — including one dispatched
 * later in the same tick — can merge into it.
 */
function HydrationPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext()
  const hydratedRef = React.useRef(false)

  React.useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    const parsed = parseDocumentContent(initialContent)

    if (parsed.kind === "lexical") {
      const nextState = editor.parseEditorState(JSON.stringify(parsed.state))
      editor.setEditorState(nextState, { tag: SYNAPCITY_HYDRATION_TAG })
      return
    }

    editor.update(
      () => {
        $convertFromMarkdownString(parsed.text, EDITOR_TRANSFORMERS)
      },
      { discrete: true, tag: SYNAPCITY_HYDRATION_TAG }
    )
  }, [editor, initialContent])

  return null
}

/**
 * `editable` is set at init from the prop; this keeps later prop changes
 * (the header's view/edit toggle) in sync. `setEditable` notifies editable
 * listeners only — it does not dispatch an editor update, so it can never
 * look like a content mutation (pinned by test).
 */
function EditableSyncPlugin({ readOnly }: { readOnly: boolean }) {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  return null
}

/** The single update listener (ADR-3), attached once per composer. */
function EditorSyncPlugin({
  onContentChanged,
  onGenuineEdit,
}: {
  onContentChanged: (editorState: EditorState) => void
  onGenuineEdit: (editorState: EditorState) => void
}) {
  const [editor] = useLexicalComposerContext()

  // Ref-mirrored so the listener (registered once) always calls the
  // latest callbacks without re-registering per render.
  const callbacksRef = React.useRef({
    onContentChanged,
    onGenuineEdit,
  })
  React.useEffect(() => {
    callbacksRef.current = {
      onContentChanged,
      onGenuineEdit,
    }
  })

  React.useEffect(
    () =>
      attachDocumentEditorSync(editor, {
        onContentChanged: (state) => {
          callbacksRef.current.onContentChanged(state)
        },
        onGenuineEdit: (state) => callbacksRef.current.onGenuineEdit(state),
      }),
    [editor]
  )

  return null
}

function ActiveEditorBridgePlugin() {
  const [editor] = useLexicalComposerContext()
  const setActiveEditor = useSetActiveEditor()

  React.useEffect(() => {
    setActiveEditor(editor)
    return () => setActiveEditor(null)
  }, [editor, setActiveEditor])

  return null
}

function BlockTypePlugin({
  onBlockTypeChanged,
}: {
  onBlockTypeChanged: (blockType: DocumentBlockType) => void
}) {
  const [editor] = useLexicalComposerContext()

  React.useEffect(() => {
    const publish = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const block = selection.anchor.getNode().getTopLevelElementOrThrow()
        let blockType: DocumentBlockType = "Paragraph"

        if ($isHeadingNode(block)) {
          const tag = block.getTag()
          blockType = tag === "h1" ? "Heading 1" : tag === "h2" ? "Heading 2" : "Heading 3"
        } else if ($isQuoteNode(block)) {
          blockType = "Quote"
        } else if ($isListNode(block)) {
          const listType = block.getListType()
          blockType =
            listType === "number"
              ? "Numbered list"
              : listType === "check"
                ? "Checklist"
                : "Bulleted list"
        }

        onBlockTypeChanged(blockType)
      })
      return false
    }

    publish()
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      publish,
      COMMAND_PRIORITY_LOW
    )
  }, [editor, onBlockTypeChanged])

  return null
}



export type { LexicalEditor }
