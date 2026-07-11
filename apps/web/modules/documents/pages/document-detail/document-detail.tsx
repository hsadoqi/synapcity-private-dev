"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, FileQuestion } from "lucide-react"

import { Button, ErrorState } from "@workspace/ui/components"
import { DocumentEditorShell } from "./components/document-editor-shell"
import { loadDocumentById } from "@/modules/documents/services/document-data"

interface DocumentDetailPageProps {
  documentId: string
}

const DocumentHeader = ({
  metadata: { id: documentId },
}: {
  metadata: {
    id: string
  }
}) => (
  <div className="flex flex-col items-start gap-4">
    <p className="text-xs text-muted-foreground uppercase">Document</p>
    <h1 className="text-xl font-semibold tracking-tight md:text-3xl">
      Document {documentId}
    </h1>
    <span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3" />
        July 11, 2026
      </span>
    </span>
  </div>
)

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
    <div className="flex flex-1 scroll-mt-12 justify-center gap-8 overflow-hidden p-6 md:p-12">
      <div className="flex w-full max-w-7xl flex-1 flex-col gap-8 transition-transform duration-300 ease-linear xl:h-full">
        <DocumentHeader
          metadata={{
            id: documentId,
          }}
        />
        <DocumentEditorShell
          key={documentId}
          documentId={documentId}
          initialDocument={documentState.document}
        />
      </div>
    </div>
  )
}
