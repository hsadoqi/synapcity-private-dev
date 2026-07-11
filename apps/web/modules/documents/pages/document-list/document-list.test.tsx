import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DocumentListPage } from "./document-list"

vi.mock("@/modules/documents/services/document-data", () => ({
  loadDocuments: vi.fn(),
}))

const { loadDocuments } = await import("@/modules/documents/services/document-data")

describe("DocumentListPage", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders an empty state when there are no documents", async () => {
    vi.mocked(loadDocuments).mockReturnValue([])

    render(<DocumentListPage />)

    await waitFor(() => {
      expect(screen.getByText("No documents yet")).toBeInTheDocument()
    })
  })

  it("renders an error state when document loading fails", async () => {
    vi.mocked(loadDocuments).mockImplementation(() => {
      throw new Error("storage failed")
    })

    render(<DocumentListPage />)

    await waitFor(() => {
      expect(
        screen.getByText("Couldn’t load documents")
      ).toBeInTheDocument()
    })
  })
})
