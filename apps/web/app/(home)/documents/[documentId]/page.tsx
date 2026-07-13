import { DocumentDetailPage } from "@/modules/documents/pages/document-detail/document-detail"
import { loadDocumentById } from "@/modules/documents/services/document-data"

interface DocumentDetailRouteProps {
  params: Promise<{ documentId: string }>
}

export default async function DocumentDetailRoute({
  params,
}: DocumentDetailRouteProps) {
  const { documentId } = await params
  const initialDocument = loadDocumentById(documentId)

  return (
    <DocumentDetailPage
      key={documentId}
      documentId={documentId}
      initialDocument={initialDocument}
    />
  )
}
