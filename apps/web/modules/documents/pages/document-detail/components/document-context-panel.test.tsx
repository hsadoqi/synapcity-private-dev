import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@workspace/ui/components"

import type { OutlineEntry } from "@/modules/documents/editor/derive-outline"
import {
  DocumentContextPanel,
  type DocumentContextSectionId,
} from "./document-context-panel"

const outline: OutlineEntry[] = [
  {
    nodeKey: "heading-1",
    depth: 1,
    label: "Product vision",
    children: [],
  },
]

function Harness({
  onSelect = vi.fn(),
}: {
  onSelect?: (entry: OutlineEntry) => void
}) {
  const [activeSection, setActiveSection] =
    React.useState<DocumentContextSectionId>("outline")

  return (
    <TooltipProvider>
      <DocumentContextPanel
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
        outline={outline}
        properties={[{ label: "Slug", value: "product-vision" }]}
        related={[
          {
            id: "related-1",
            title: "Related note",
            reason: "Mentioned in the same workspace",
          },
        ]}
        onSelectOutlineEntry={onSelect}
      />
    </TooltipProvider>
  )
}

describe("DocumentContextPanel", () => {
  it("starts on the document-owned Outline section", () => {
    render(<Harness />)

    expect(screen.getByRole("region", { name: "Outline" })).toBeInTheDocument()
    expect(
      screen.getByRole("tree", { name: "Document headings" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("treeitem", { name: "Product vision" })
    ).toBeInTheDocument()
    expect(screen.queryByText("product-vision")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Related note/ })).not.toBeInTheDocument()
  })

  it("switches between only the real document-owned section bodies", () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole("radio", { name: "Properties" }))
    expect(
      screen.getByRole("region", { name: "Properties" })
    ).toBeInTheDocument()
    expect(screen.getByText("product-vision")).toBeInTheDocument()
    expect(screen.queryByText("Product vision")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Related note/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("radio", { name: "Related" }))
    expect(screen.getByRole("region", { name: "Related" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Related note/ })).toHaveAttribute(
      "href",
      "/documents/related-1"
    )
    expect(screen.queryByText("product-vision")).not.toBeInTheDocument()
    expect(screen.queryByText("Product vision")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("radio", { name: "Search" })
    ).not.toBeInTheDocument()
  })

  it("forwards outline primary actions without shell navigation state", () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)

    fireEvent.click(screen.getByRole("treeitem", { name: "Product vision" }))

    expect(onSelect).toHaveBeenCalledWith(outline[0])
  })
})
