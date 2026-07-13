import { $getRoot } from "lexical"
import type { EditorState } from "lexical"

export interface DocumentMetrics {
  words: number
  characters: number
}

/**
 * Pure derivation: EditorState in, counts out. Word counting matches the
 * prototype's definition (whitespace-delimited runs) so the header's
 * "N words" doesn't shift meaning across the editor swap.
 */
export function deriveMetrics(editorState: EditorState): DocumentMetrics {
  const text = editorState.read(() => $getRoot().getTextContent())
  const trimmed = text.trim()

  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    characters: text.length,
  }
}

export function areMetricsEqual(a: DocumentMetrics, b: DocumentMetrics): boolean {
  return a.words === b.words && a.characters === b.characters
}
