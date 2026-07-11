"use client"

import * as React from "react"
import Link from "next/link"
import { FileText } from "lucide-react"

import { EmptyState, ErrorState } from "@workspace/ui/components"
import { loadDocuments } from "@/modules/documents/services/document-data"

export function DocumentListPage() {
  const documentState = React.useMemo(() => {
    try {
      return {
        documents: loadDocuments(),
        status: "ready" as const,
      }
    } catch {
      return {
        documents: [],
        status: "error" as const,
      }
    }
  }, [])

  const content =
    documentState.status === "error" ? (
      <ErrorState
        title="Couldn’t load documents"
        description="Your document library could not be read from local storage."
      />
    ) : documentState.documents.length === 0 ? (
      <EmptyState
        icon={<FileText className="size-10" aria-hidden="true" />}
        title="No documents yet"
        description="Create your first document to start building your workspace."
      />
    ) : (
      <div className="grid gap-3">
        {documentState.documents.map((document) => (
          <Link
            key={document.id}
            href={`/documents/${document.id}`}
            className="rounded-lg border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary"
          >
            <div className={"font-medium"}>{document.title}</div>
            <div className={"mt-1 text-sm text-muted-foreground"}>
              /{document.slug}
            </div>
          </Link>
        ))}
      </div>
    )

  return (
    <div className={"mx-auto mt-16 w-full max-w-7xl space-y-4 p-6"}>
      <div className={"space-y-1"}>
        <p className="text-sm text-muted-foreground">Documents</p>
        <h1 className={"text-3xl font-semibold tracking-tight"}>
          Document library
        </h1>
      </div>

      {content}
    </div>
  )
}
