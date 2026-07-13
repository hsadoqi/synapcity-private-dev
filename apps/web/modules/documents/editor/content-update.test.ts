import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
} from "lexical"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { describe, expect, it, vi } from "vitest"

import {
  attachDocumentEditorSync,
  SYNAPCITY_HYDRATION_TAG,
} from "./content-update"
import { EDITOR_NODES } from "./editor-nodes"
import { EDITOR_TRANSFORMERS } from "./editor-transformers"
import { LEGACY_MARKDOWN_FIXTURE } from "./legacy-content-fixtures"

function createHarness() {
  const editor = createEditor({
    namespace: "test",
    nodes: EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
  const onContentChanged = vi.fn()
  const onGenuineEdit = vi.fn()
  const detach = attachDocumentEditorSync(editor, {
    onContentChanged,
    onGenuineEdit,
  })
  return { editor, onContentChanged, onGenuineEdit, detach }
}

describe("attachDocumentEditorSync / isGenuineContentUpdate", () => {
  it("publishes the hydrated state once at attach without a genuine edit", () => {
    const { onContentChanged, onGenuineEdit } = createHarness()

    expect(onContentChanged).toHaveBeenCalledTimes(1)
    expect(onGenuineEdit).not.toHaveBeenCalled()
  })

  it("ignores tagged hydration writes even with the listener attached", () => {
    // Stricter than the real flow (where hydration happens during
    // composer init, before listeners exist): here the listener IS
    // attached, and the tag alone must reject the write.
    const { editor, onContentChanged, onGenuineEdit } = createHarness()

    editor.update(
      () => {
        $convertFromMarkdownString(LEGACY_MARKDOWN_FIXTURE, EDITOR_TRANSFORMERS)
      },
      { discrete: true, tag: SYNAPCITY_HYDRATION_TAG }
    )

    expect(onGenuineEdit).not.toHaveBeenCalled()
    // Attach publish (pre-hydration empty state) + the hydration mutation
    // itself. onContentChanged must fire for both: read models (outline,
    // word count) need to reflect hydrated content even though the write
    // is excluded from persistence.
    expect(onContentChanged).toHaveBeenCalledTimes(2)
  })

  it("ignores selection-only updates", () => {
    const { editor, onGenuineEdit } = createHarness()
    editor.update(
      () => {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode("hello"))
        $getRoot().append(paragraph)
      },
      { discrete: true, tag: SYNAPCITY_HYDRATION_TAG }
    )

    editor.update(
      () => {
        $getRoot().selectEnd()
      },
      { discrete: true }
    )

    expect(onGenuineEdit).not.toHaveBeenCalled()
  })

  it("ignores editable-state changes", () => {
    const { editor, onContentChanged, onGenuineEdit } = createHarness()

    editor.setEditable(false)
    editor.setEditable(true)

    expect(onGenuineEdit).not.toHaveBeenCalled()
    expect(onContentChanged).toHaveBeenCalledTimes(1)
  })

  it("ignores updates that mutate nothing (plugin no-op normalization)", () => {
    const { editor, onGenuineEdit } = createHarness()

    editor.update(() => {}, { discrete: true })
    editor.update(
      () => {
        $getRoot() // read-only access inside an update
      },
      { discrete: true }
    )

    expect(onGenuineEdit).not.toHaveBeenCalled()
  })

  it("treats real mutations as genuine edits", () => {
    const { editor, onContentChanged, onGenuineEdit } = createHarness()

    editor.update(
      () => {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode("typed by a user"))
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )

    expect(onGenuineEdit).toHaveBeenCalledTimes(1)
    expect(onContentChanged).toHaveBeenCalledTimes(2) // attach + edit
  })

  it("stops publishing after detach", () => {
    const { editor, detach, onGenuineEdit } = createHarness()
    detach()

    editor.update(
      () => {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode("after detach"))
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )

    expect(onGenuineEdit).not.toHaveBeenCalled()
  })
})
