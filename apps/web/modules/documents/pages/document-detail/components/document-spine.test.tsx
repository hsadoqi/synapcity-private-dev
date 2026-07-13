import { describe, expect, it } from "vitest"

import type { OutlineEntry } from "@/modules/documents/editor/derive-outline"
import { collectSpineSections } from "./document-spine"

function entry(partial: Partial<OutlineEntry> & Pick<OutlineEntry, "nodeKey" | "depth" | "label">): OutlineEntry {
  return { children: [], ...partial }
}

describe("collectSpineSections", () => {
  it("flattens H2 sections nested under a title H1, in document order", () => {
    const outline: OutlineEntry[] = [
      entry({
        nodeKey: "title",
        depth: 1,
        label: "AI Strategy Brief",
        children: [
          entry({ nodeKey: "purpose", depth: 2, label: "Purpose" }),
          entry({ nodeKey: "priorities", depth: 2, label: "Strategic Priorities" }),
        ],
      }),
    ]

    expect(collectSpineSections(outline).map((section) => section.nodeKey)).toEqual([
      "purpose",
      "priorities",
    ])
  })

  it("excludes H3 subheadings from the numbered list", () => {
    const outline: OutlineEntry[] = [
      entry({
        nodeKey: "section",
        depth: 2,
        label: "Section",
        children: [entry({ nodeKey: "sub", depth: 3, label: "Detail" })],
      }),
    ]

    expect(collectSpineSections(outline).map((section) => section.nodeKey)).toEqual([
      "section",
    ])
  })

  it("returns an empty list for a document with no headings", () => {
    expect(collectSpineSections([])).toEqual([])
  })
})
