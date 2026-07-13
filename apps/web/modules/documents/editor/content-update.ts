import type { EditorState, LexicalEditor, NodeKey } from "lexical"

/**
 * Update tag for every programmatic write this module itself performs
 * against an editor (tests, future repairs). Anything carrying this tag
 * is by definition not a user edit.
 */
export const SYNAPCITY_HYDRATION_TAG = "synapcity:hydrate"

/**
 * Lexical's own tag for programmatic state initialization: the composer's
 * deferred initial-state commit (see below), `setEditorState`, and other
 * writes that merge into the current history entry instead of recording a
 * user action. User input (typing, commands, toolbar dispatch, paste)
 * never carries it; undo/redo carry `historic` instead.
 */
export const HISTORY_MERGE_TAG = "history-merge"

/**
 * The subset of Lexical's update-listener payload the gate needs. Kept
 * structural (not `UpdateListener` itself) so tests can construct it
 * without a live editor where useful.
 */
export interface ContentUpdateSignal {
  tags: Set<string>
  dirtyElements: Map<NodeKey, boolean>
  dirtyLeaves: Set<NodeKey>
  prevEditorState: EditorState
  editorState: EditorState
}

/** The state actually changed (some node was created/mutated/removed). */
export function isContentMutation(signal: ContentUpdateSignal): boolean {
  return signal.dirtyElements.size > 0 || signal.dirtyLeaves.size > 0
}

/**
 * THE definition of "a genuine user content edit" for persistence and
 * migration purposes (ADR-3). A save is scheduled if and only if this
 * returns true. Each excluded case, and why:
 *
 * - **Hydration.** VERIFIED BY PROBE, not assumed: `LexicalComposer`
 *   defers the initial-state commit until the root element attaches,
 *   which is AFTER plugin effects have registered update listeners — so
 *   hydration genuinely reaches this gate, as a dirty update tagged
 *   `history-merge`. That tag (plus our own `SYNAPCITY_HYDRATION_TAG`
 *   for module-owned writes) is what excludes it. Note hydration IS a
 *   content mutation (`isContentMutation` true) — read models must
 *   update from it; it just must never schedule a save.
 * - **Selection-only updates** (caret moves, focus, selection format on
 *   a collapsed selection) — empty dirty sets; rejected by
 *   `isContentMutation`.
 * - **Editable-state changes** — `editor.setEditable()` notifies
 *   editable listeners, not update listeners; never reaches the gate
 *   (pinned by test).
 * - **History registration** — `HistoryPlugin` mount registers
 *   listeners; dispatches no update (pinned by the workspace
 *   integration test). Undo/redo themselves DO mutate content
 *   (`historic`-tagged, dirty sets non-empty) and are deliberately
 *   genuine — reverting a document is a user edit that must persist.
 * - **Plugin normalization that changes nothing** — empty dirty sets.
 *
 * Residual risk: a plugin performing an untagged, genuinely dirtying
 * write with no user cause would slip through. The Phase-1 plugin set
 * (RichText, History, List, Link, MarkdownShortcut) has none — pinned by
 * the migration-only-on-edit integration test against the real composer,
 * so a future plugin that violates this fails a test instead of silently
 * migrating legacy documents.
 */
export function isGenuineContentUpdate(signal: ContentUpdateSignal): boolean {
  if (
    signal.tags.has(SYNAPCITY_HYDRATION_TAG) ||
    signal.tags.has(HISTORY_MERGE_TAG)
  ) {
    return false
  }

  return isContentMutation(signal)
}

export interface DocumentEditorSyncCallbacks {
  /**
   * Fired once at attach time, and again after every content mutation —
   * INCLUDING hydration (which may commit after attach, see above). This
   * is the read-model feed (outline, counts, persistence-snapshot
   * source); receivers derive from the immutable EditorState, never
   * mirror it.
   */
  onContentChanged: (editorState: EditorState) => void
  /** Fired only for genuine user edits (drives the save coordinator). */
  onGenuineEdit: (editorState: EditorState) => void
}

/**
 * The single update listener (ADR-3): one `registerUpdateListener` feeds
 * persistence and every derived read model. Extracted from the React
 * plugin so headless tests can attach it to a bare editor and prove the
 * gate's behavior against real Lexical updates.
 *
 * Returns the unregister function.
 */
export function attachDocumentEditorSync(
  editor: LexicalEditor,
  callbacks: DocumentEditorSyncCallbacks
): () => void {
  // Initial publish: whatever is committed right now (for envelope
  // documents whose state committed before attach, this is the real
  // content; for deferred hydration it is the empty pre-hydration state,
  // corrected by the hydration mutation moments later). A read, not an
  // update — cannot mark anything dirty or schedule a save.
  callbacks.onContentChanged(editor.getEditorState())

  return editor.registerUpdateListener(
    ({ tags, dirtyElements, dirtyLeaves, prevEditorState, editorState }) => {
      const signal: ContentUpdateSignal = {
        tags,
        dirtyElements,
        dirtyLeaves,
        prevEditorState,
        editorState,
      }

      if (!isContentMutation(signal)) {
        return
      }

      callbacks.onContentChanged(editorState)

      if (isGenuineContentUpdate(signal)) {
        callbacks.onGenuineEdit(editorState)
      }
    }
  )
}
