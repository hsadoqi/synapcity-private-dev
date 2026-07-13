import { $getRoot } from "lexical"
import type { EditorState } from "lexical"
import { $isHeadingNode } from "@lexical/rich-text"

export interface OutlineEntry {
  /** Lexical node key — resolvable to a DOM element via `editor.getElementByKey`. */
  nodeKey: string
  depth: 1 | 2 | 3
  label: string
  children: OutlineEntry[]
}

const HEADING_DEPTHS: Record<string, 1 | 2 | 3> = {
  h1: 1,
  h2: 2,
  h3: 3,
}

/**
 * Pure derivation: EditorState in, outline out. Walks only the root's
 * direct children — headings nested inside other blocks (quotes, future
 * tables) are intentionally not outline entries, matching how the
 * document's structure reads.
 */
export function deriveOutline(editorState: EditorState): OutlineEntry[] {
  return editorState.read(() => {
    const entries: OutlineEntry[] = []
    const ancestors: OutlineEntry[] = []

    for (const node of $getRoot().getChildren()) {
      if (!$isHeadingNode(node)) continue

      const depth = HEADING_DEPTHS[node.getTag()]
      if (!depth) continue

      const label = node.getTextContent().trim()
      if (!label) continue

      const entry: OutlineEntry = {
        nodeKey: node.getKey(),
        depth,
        label,
        children: [],
      }

      while (ancestors.at(-1)?.depth && ancestors.at(-1)!.depth >= depth) {
        ancestors.pop()
      }

      const parent = ancestors.at(-1)
      if (parent) {
        parent.children.push(entry)
      } else {
        entries.push(entry)
      }
      ancestors.push(entry)
    }

    return entries
  })
}

export function areOutlinesEqual(a: OutlineEntry[], b: OutlineEntry[]): boolean {
  if (a.length !== b.length) return false
  return a.every((entry, index) => {
    const other = b[index]!
    return (
      entry.nodeKey === other.nodeKey &&
      entry.depth === other.depth &&
      entry.label === other.label &&
      areOutlinesEqual(entry.children, other.children)
    )
  })
}
