import * as React from "react"
import { renderToString } from "react-dom/server"
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DocumentDetailPage } from "./document-detail"
import type { DocumentRecord } from "@/modules/documents/types"

vi.mock("@/modules/documents/services/document-data", () => ({
  loadDocumentById: vi.fn(),
}))

vi.mock("./components/document-workspace", () => ({
  DocumentWorkspace: ({ initialDocument }: { initialDocument: DocumentRecord }) => (
    <div>{initialDocument.title}</div>
  ),
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

    render(
      <DocumentDetailPage documentId="missing-doc" initialDocument={null} />
    )

    await waitFor(() => {
      expect(screen.getByText("Document not found")).toBeInTheDocument()
    })
  })

  it("renders an error state when document loading throws", async () => {
    vi.mocked(loadDocumentById).mockImplementation(() => {
      throw new Error("storage failed")
    })

    render(
      <DocumentDetailPage documentId="broken-doc" initialDocument={null} />
    )

    await waitFor(() => {
      expect(
        screen.getByText("Couldn’t load this document")
      ).toBeInTheDocument()
    })
  })

  it("renders the server snapshot first, then reconciles browser storage", async () => {
    const serverDocument = {
      id: "doc-2",
      title: "Server title",
      slug: "server-title",
      content: "",
      plainText: "",
      createdAt: "2026-01-02T09:00:00.000Z",
      updatedAt: "2026-01-02T09:00:00.000Z",
    }
    vi.mocked(loadDocumentById).mockReturnValue({
      ...serverDocument,
      title: "Stored title",
      updatedAt: "2026-07-12T09:00:00.000Z",
    })

    const serverMarkup = renderToString(
      <DocumentDetailPage
        documentId="doc-2"
        initialDocument={serverDocument}
      />
    )
    expect(serverMarkup).toContain("Server title")
    expect(loadDocumentById).not.toHaveBeenCalled()

    render(
      <DocumentDetailPage
        documentId="doc-2"
        initialDocument={serverDocument}
      />
    )
    await waitFor(() => {
      expect(screen.getByText("Stored title")).toBeInTheDocument()
    })
  })
})
