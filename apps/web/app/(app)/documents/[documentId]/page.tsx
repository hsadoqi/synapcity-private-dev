import { DocumentDetailPage } from "@/modules/documents"
import { ThemeScopeProvider } from "@/modules/theme"

interface DocumentDetailRouteProps {
  params: Promise<{ documentId: string }>
}

export default async function DocumentDetailRoute({
  params,
}: DocumentDetailRouteProps) {
  const { documentId } = await params
  return (
    <ThemeScopeProvider scope="document" scopeId={documentId}>
      <DocumentDetailPage documentId={documentId} />
    </ThemeScopeProvider>
  )
}
