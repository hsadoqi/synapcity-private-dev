"use client"

import * as React from "react"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button, ErrorState } from "@workspace/ui/components"
import { DocumentWorkspace } from "./components/document-workspace"
import { loadDocumentById } from "@/modules/documents/services/document-data"

interface DocumentDetailPageProps {
  documentId: string
}

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const documentState = React.useMemo(() => {
    try {
      return {
        document: loadDocumentById(documentId),
        status: "ready" as const,
      }
    } catch {
      return {
        document: null,
        status: "error" as const,
      }
    }
  }, [documentId])

  if (documentState.status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <ErrorState
          title="Couldn’t load this document"
          description="The document content could not be read from local storage."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/documents">Back to documents</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (!documentState.document) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <ErrorState
          icon={<FileQuestion className="size-10" aria-hidden="true" />}
          title="Document not found"
          description="This document no longer exists in local storage."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/documents">Back to documents</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 justify-center p-4 md:p-8 xl:p-10">
      <div className="flex w-full max-w-5xl flex-col">
        <DocumentWorkspace
          key={documentId}
          documentId={documentId}
          initialDocument={documentState.document}
        />
      </div>
    </div>
  )
}
