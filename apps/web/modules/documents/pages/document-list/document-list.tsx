import Link from "next/link"

import { documentListStyles } from "./document-list.styles"

const sampleDocuments = [
  { id: "doc-1", title: "Product vision", slug: "product-vision" },
  { id: "doc-2", title: "Design principles", slug: "design-principles" },
]

export function DocumentListPage() {
  return (
    <div className={documentListStyles.page}>
      <div className={documentListStyles.heading}>
        <p className="text-sm text-muted-foreground">Documents</p>
        <h1 className={documentListStyles.title}>Document library</h1>
      </div>

      <div className={documentListStyles.list}>
        {sampleDocuments.map((document) => (
          <Link
            key={document.id}
            href={`/documents/${document.id}`}
            className={documentListStyles.card}
          >
            <div className={documentListStyles.cardTitle}>{document.title}</div>
            <div className={documentListStyles.cardMeta}>/{document.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
