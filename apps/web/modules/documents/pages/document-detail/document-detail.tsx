"use client"

import * as React from "react"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button, ErrorState } from "@workspace/ui/components"
import { DocumentWorkspace } from "./components/document-workspace"
import { loadDocumentById } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

interface DocumentDetailPageProps {
  documentId: string
  initialDocument: DocumentRecord | null
}

interface DocumentState {
  document: DocumentRecord | null
  status: "ready" | "error"
}

const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function DocumentDetailPage({
  documentId,
  initialDocument,
}: DocumentDetailPageProps) {
  const isHydrated = React.useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  )

  const documentState = React.useMemo<DocumentState>(() => {
    if (!isHydrated) {
      return {
        document: initialDocument,
        status: "ready",
      }
    }

    try {
      return {
        document: loadDocumentById(documentId),
        status: "ready",
      }
    } catch {
      return {
        document: null,
        status: "error",
      }
    }
  }, [documentId, initialDocument, isHydrated])

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
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-4 md:p-8 xl:p-10">
      <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden">
        <DocumentWorkspace
          key={documentId}
          documentId={documentId}
          initialDocument={documentState.document}
        />
      </div>
    </div>
  )
}
