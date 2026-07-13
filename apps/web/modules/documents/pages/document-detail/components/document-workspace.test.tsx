import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical"
import type { LexicalEditor } from "lexical"

import { ContextPanelSlotProvider } from "@/components/context-panel"
import { LEGACY_MARKDOWN_FIXTURE } from "@/modules/documents/editor/legacy-content-fixtures"
import {
  LEXICAL_CONTENT_FORMAT,
  parseDocumentContent,
} from "@/modules/documents/editor/serialization"
import type { DocumentRecord } from "@/modules/documents/types"
import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"

import { DocumentWorkspace } from "./document-workspace"

const STORAGE_KEY = "synapcity.documents"

function seedLegacyRecord(): DocumentRecord {
  const record: DocumentRecord = {
    id: "doc-legacy",
    title: "Legacy doc",
    slug: "legacy-doc",
    content: LEGACY_MARKDOWN_FIXTURE,
    plainText:
      "Product vision Document content is now editable from the route shell.",
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-01T09:00:00.000Z",
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record]))
  return record
}

function readStoredContent(documentId: string): string {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const records = raw ? (JSON.parse(raw) as DocumentRecord[]) : []
  const record = records.find((item) => item.id === documentId)
  if (!record) throw new Error(`record ${documentId} missing from storage`)
  return record.content
}

function renderWorkspace(record: DocumentRecord) {
  return render(
    <TooltipProvider>
      <ContextPanelSlotProvider>
        <DocumentWorkspace documentId={record.id} initialDocument={record} />
      </ContextPanelSlotProvider>
    </TooltipProvider>
  )
}

function getMountedEditor(container: HTMLElement): LexicalEditor {
  const element = container.querySelector('[contenteditable="true"]')
  const editor = (
    element as unknown as { __lexicalEditor?: LexicalEditor } | null
  )?.__lexicalEditor
  if (!editor) throw new Error("Lexical editor not mounted")
  return editor
}

function appendUserEdit(editor: LexicalEditor) {
  act(() => {
    editor.update(
      () => {
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode("Typed by a user."))
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )
  })
}

beforeEach(() => {
  window.localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("DocumentWorkspace legacy-content migration (ADR-3)", () => {
  it("never writes when a legacy document is merely opened, viewed read-only, or closed", async () => {
    const record = seedLegacyRecord()
    const rawBefore = window.localStorage.getItem(STORAGE_KEY)

    const view = renderWorkspace(record)

    // Hydration + full plugin mount (RichText, History, List, Link,
    // MarkdownShortcut) + any debounce window elapsing…
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    // …plus editable-state changes through the real UI…
    fireEvent.click(screen.getByRole("button", { name: "Switch to viewing" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    fireEvent.click(screen.getByRole("button", { name: "Switch to editing" }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    // …plus unmount (teardown flush with nothing pending).
    view.unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(rawBefore)
    expect(readStoredContent(record.id)).toBe(LEGACY_MARKDOWN_FIXTURE)
  })

  it("commits the envelope on the first save caused by a genuine edit", async () => {
    const record = seedLegacyRecord()
    const view = renderWorkspace(record)

    appendUserEdit(getMountedEditor(view.container))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000) // debounce + async persist
    })

    const stored = readStoredContent(record.id)
    const parsed = parseDocumentContent(stored)
    expect(parsed.kind).toBe("lexical")
    expect(stored).toContain(LEXICAL_CONTENT_FORMAT)
    expect(stored).toContain("Typed by a user.")
    // The hydrated legacy content came along, not just the new edit.
    expect(stored).toContain("Product vision")

    view.unmount()
  })

  it("flushes a pending edit on unmount instead of dropping it", async () => {
    const record = seedLegacyRecord()
    const view = renderWorkspace(record)

    appendUserEdit(getMountedEditor(view.container))

    // Unmount inside the debounce window — the teardown flush must
    // perform the write synchronously.
    view.unmount()

    const parsed = parseDocumentContent(readStoredContent(record.id))
    expect(parsed.kind).toBe("lexical")
    expect(readStoredContent(record.id)).toContain("Typed by a user.")
  })
})
