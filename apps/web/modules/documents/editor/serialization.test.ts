import { createEditor } from "lexical"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { describe, expect, it } from "vitest"

import { loadDocuments } from "@/modules/documents/services/document-data"

import { EDITOR_NODES } from "./editor-nodes"
import { EDITOR_TRANSFORMERS } from "./editor-transformers"
import {
  LEGACY_MARKDOWN_FIXTURE,
  LEGACY_MARKDOWN_MULTI_HEADING_FIXTURE,
} from "./legacy-content-fixtures"
import {
  createContentEnvelope,
  createPersistenceSnapshot,
  derivePlainText,
  LEXICAL_CONTENT_FORMAT,
  parseDocumentContent,
} from "./serialization"

function createHeadlessEditor() {
  return createEditor({
    namespace: "test",
    nodes: EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
}

function hydrateMarkdown(markdown: string) {
  const editor = createHeadlessEditor()
  editor.update(
    () => {
      $convertFromMarkdownString(markdown, EDITOR_TRANSFORMERS)
    },
    { discrete: true }
  )
  return editor
}

describe("parseDocumentContent (total over arbitrary strings)", () => {
  it("recognizes a v1 envelope", () => {
    const editor = hydrateMarkdown(LEGACY_MARKDOWN_FIXTURE)
    const envelope = createContentEnvelope(editor.getEditorState().toJSON())

    const parsed = parseDocumentContent(envelope)

    expect(parsed.kind).toBe("lexical")
    if (parsed.kind === "lexical") {
      expect(parsed.version).toBe(1)
      expect(parsed.state.root).toBeDefined()
    }
  })

  it.each([
    ["plain markdown", LEGACY_MARKDOWN_FIXTURE],
    ["empty string", ""],
    ["whitespace", "   \n\t"],
    ["broken JSON that starts like an object", "{not json at all"],
    ["JSON object that is not an envelope", '{"a": 1}'],
    ["JSON array", "[1, 2, 3]"],
    ["JSON string", '"just a string"'],
    ["prose starting with a brace", "{TODO} finish this section"],
    [
      "envelope-shaped with wrong format",
      JSON.stringify({ format: "other", version: 1, editorState: {} }),
    ],
    [
      "envelope-shaped with unknown version",
      JSON.stringify({
        format: LEXICAL_CONTENT_FORMAT,
        version: 2,
        editorState: {},
      }),
    ],
    [
      "envelope-shaped with missing editorState",
      JSON.stringify({ format: LEXICAL_CONTENT_FORMAT, version: 1 }),
    ],
    [
      "envelope-shaped with null editorState",
      JSON.stringify({
        format: LEXICAL_CONTENT_FORMAT,
        version: 1,
        editorState: null,
      }),
    ],
  ])("maps %s to legacy-markdown without throwing", (_label, content) => {
    const parsed = parseDocumentContent(content)

    expect(parsed).toEqual({ kind: "legacy-markdown", text: content })
  })
})

describe("envelope round-trip", () => {
  it("hydrated legacy markdown survives snapshot → parse → rehydrate", () => {
    const editor = hydrateMarkdown(LEGACY_MARKDOWN_MULTI_HEADING_FIXTURE)
    const originalText = derivePlainText(editor.getEditorState())

    const snapshot = createPersistenceSnapshot(editor.getEditorState())
    expect(snapshot.plainText).toBe(originalText)

    const parsed = parseDocumentContent(snapshot.content)
    expect(parsed.kind).toBe("lexical")
    if (parsed.kind !== "lexical") return

    const rehydrated = createHeadlessEditor()
    rehydrated.setEditorState(
      rehydrated.parseEditorState(JSON.stringify(parsed.state))
    )

    expect(derivePlainText(rehydrated.getEditorState())).toBe(originalText)
    expect(rehydrated.getEditorState().toJSON()).toEqual(parsed.state)
  })
})

describe("seed documents", () => {
  it("ship as valid v1 envelopes that hydrate cleanly", () => {
    // jsdom localStorage is empty here, so loadDocuments returns seeds.
    const seeds = loadDocuments()
    expect(seeds.length).toBeGreaterThan(0)

    for (const seed of seeds) {
      const parsed = parseDocumentContent(seed.content)
      expect(parsed.kind).toBe("lexical")
      if (parsed.kind !== "lexical") continue

      const editor = createHeadlessEditor()
      editor.setEditorState(
        editor.parseEditorState(JSON.stringify(parsed.state))
      )

      // The stored plainText matches what the editor derives — the seam
      // between the dependency-free seed literals and the editor module.
      expect(derivePlainText(editor.getEditorState())).toBe(seed.plainText)
    }
  })
})
