import { $getRoot } from "lexical"
import type { EditorState, SerializedEditorState } from "lexical"

/**
 * Versioned envelope persisted into the existing `DocumentRecord.content`
 * string field (ADR-3). No shared-type change: the envelope is
 * self-describing, so `content` stays a plain string as far as
 * `@workspace/types` is concerned until the Phase-2 persistence rework.
 */
export const LEXICAL_CONTENT_FORMAT = "synapcity.lexical"

export interface LexicalContentEnvelopeV1 {
  format: typeof LEXICAL_CONTENT_FORMAT
  version: 1
  editorState: SerializedEditorState
}

export type ParsedDocumentContent =
  | { kind: "lexical"; version: 1; state: SerializedEditorState }
  | { kind: "legacy-markdown"; text: string }

/**
 * Total function: any string maps to exactly one variant, never throws.
 * The single JSON.parse + format check for the whole app lives here —
 * call sites branch on `kind`, they never probe strings themselves.
 *
 * Version gating: only `version: 1` exists. When a v2 envelope is
 * introduced, its migration step is added HERE (before the legacy
 * fallback), so call sites stay untouched. Until then, an envelope-shaped
 * value with an unknown version cannot occur in storage we wrote; if one
 * ever appears it falls through to legacy-markdown, which at worst shows
 * the raw JSON as text instead of losing it silently.
 */
export function parseDocumentContent(content: string): ParsedDocumentContent {
  const trimmed = content.trimStart()

  // Cheap guard: envelopes always serialize as a JSON object. Anything
  // else (markdown, empty string, prose starting with "[") skips the
  // parse attempt entirely.
  if (trimmed.startsWith("{")) {
    let candidate: unknown
    try {
      candidate = JSON.parse(trimmed)
    } catch {
      candidate = null
    }

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as { format?: unknown }).format === LEXICAL_CONTENT_FORMAT &&
      (candidate as { version?: unknown }).version === 1 &&
      typeof (candidate as { editorState?: unknown }).editorState ===
        "object" &&
      (candidate as { editorState?: unknown }).editorState !== null
    ) {
      return {
        kind: "lexical",
        version: 1,
        state: (candidate as LexicalContentEnvelopeV1).editorState,
      }
    }
  }

  return { kind: "legacy-markdown", text: content }
}

export function createContentEnvelope(state: SerializedEditorState): string {
  const envelope: LexicalContentEnvelopeV1 = {
    format: LEXICAL_CONTENT_FORMAT,
    version: 1,
    editorState: state,
  }
  return JSON.stringify(envelope)
}

export interface PersistenceSnapshot {
  content: string
  plainText: string
}

/**
 * The exact snapshot handed to persistence (ADR-3): the serialized editor
 * state wrapped in the v1 envelope, plus plain text derived from the same
 * immutable EditorState — never from separately mirrored React state.
 */
export function createPersistenceSnapshot(
  editorState: EditorState
): PersistenceSnapshot {
  return {
    content: createContentEnvelope(editorState.toJSON()),
    plainText: derivePlainText(editorState),
  }
}

export function derivePlainText(editorState: EditorState): string {
  return editorState
    .read(() => $getRoot().getTextContent())
    .replace(/\s+/g, " ")
    .trim()
}
