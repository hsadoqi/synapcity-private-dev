import AppProviders from "../../app-providers";

export default async function DocumentsLayout({ children, params }: { children: React.ReactNode, params: Promise<{ documentId: string }> }) {
    const { documentId } = await params;
    return (
      <AppProviders scope="document" scopeId={documentId}>
        {children}
      </AppProviders>
    )
}