import { createEditor } from "lexical"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { describe, expect, it } from "vitest"

import { areMetricsEqual, deriveMetrics } from "./derive-metrics"
import { areOutlinesEqual, deriveOutline } from "./derive-outline"
import { EDITOR_NODES } from "./editor-nodes"
import { EDITOR_TRANSFORMERS } from "./editor-transformers"
import { LEGACY_MARKDOWN_MULTI_HEADING_FIXTURE } from "./legacy-content-fixtures"

function hydrate(markdown: string) {
  const editor = createEditor({
    namespace: "test",
    nodes: EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
  editor.update(
    () => {
      $convertFromMarkdownString(markdown, EDITOR_TRANSFORMERS)
    },
    { discrete: true }
  )
  return editor
}

describe("deriveOutline", () => {
  it("returns heading entries with depth, label, and resolvable node keys", () => {
    const editor = hydrate(LEGACY_MARKDOWN_MULTI_HEADING_FIXTURE)

    const outline = deriveOutline(editor.getEditorState())

    expect(
      outline.map(({ depth, label, children }) => ({
        depth,
        label,
        children: children.map(({ depth, label, children }) => ({
          depth,
          label,
          children: children.map(({ depth, label }) => ({ depth, label })),
        })),
      }))
    ).toEqual([
      {
        depth: 1,
        label: "Title",
        children: [
          {
            depth: 2,
            label: "Section",
            children: [{ depth: 3, label: "Detail" }],
          },
        ],
      },
    ])
    for (const entry of [outline[0]!, outline[0]!.children[0]!]) {
      expect(entry.nodeKey).toBeTruthy()
    }
  })

  it("returns no entries for heading-free content", () => {
    const editor = hydrate("Just a paragraph.\n\nAnother one.")

    expect(deriveOutline(editor.getEditorState())).toEqual([])
  })

  it("areOutlinesEqual compares by value", () => {
    const editor = hydrate("# One\n\n## Two")
    const a = deriveOutline(editor.getEditorState())
    const b = deriveOutline(editor.getEditorState())

    expect(a).not.toBe(b)
    expect(areOutlinesEqual(a, b)).toBe(true)
    expect(
      areOutlinesEqual(a, [{ ...a[0]!, children: [] }])
    ).toBe(false)
  })
})

describe("deriveMetrics", () => {
  it("counts whitespace-delimited words and raw characters", () => {
    const editor = hydrate("# Title\n\nOne two three.")

    const metrics = deriveMetrics(editor.getEditorState())

    expect(metrics.words).toBe(4) // Title One two three.
    expect(metrics.characters).toBeGreaterThan(0)
  })

  it("reports zero words for empty content", () => {
    const editor = hydrate("")

    expect(deriveMetrics(editor.getEditorState()).words).toBe(0)
  })

  it("areMetricsEqual compares by value", () => {
    expect(
      areMetricsEqual({ words: 1, characters: 5 }, { words: 1, characters: 5 })
    ).toBe(true)
    expect(
      areMetricsEqual({ words: 1, characters: 5 }, { words: 2, characters: 5 })
    ).toBe(false)
  })
})
