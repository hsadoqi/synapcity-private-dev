import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DocumentDetailPage } from "./document-detail"

vi.mock("@/modules/documents/services/document-data", () => ({
  loadDocumentById: vi.fn(),
}))

vi.mock("./components/document-workspace", () => ({
  DocumentWorkspace: () => <div>Document workspace</div>,
}))

const { loadDocumentById } = await import(
  "@/modules/documents/services/document-data"
)

describe("DocumentDetailPage", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders a missing state when the document does not exist", async () => {
    vi.mocked(loadDocumentById).mockReturnValue(null)

    render(<DocumentDetailPage documentId="missing-doc" />)

    await waitFor(() => {
      expect(screen.getByText("Document not found")).toBeInTheDocument()
    })
  })

  it("renders an error state when document loading throws", async () => {
    vi.mocked(loadDocumentById).mockImplementation(() => {
      throw new Error("storage failed")
    })

    render(<DocumentDetailPage documentId="broken-doc" />)

    await waitFor(() => {
      expect(
        screen.getByText("Couldn’t load this document")
      ).toBeInTheDocument()
    })
  })
})
