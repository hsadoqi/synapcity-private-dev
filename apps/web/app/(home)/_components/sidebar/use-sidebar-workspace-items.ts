import * as React from "react"

import { loadDashboards } from "@/modules/dashboards/services/dashboard-data"
import { loadDocuments } from "@/modules/documents/services/document-data"

export type SidebarWorkspaceItem = {
  href: string
  label: string
  meta: string
}

export function useSidebarWorkspaceItems() {
  return React.useMemo(() => {
    const documentItems: SidebarWorkspaceItem[] = loadDocuments().map((document) => ({
      label: document.title,
      href: `/documents/${document.id}`,
      meta: document.summary ?? "Untitled summary",
    }))

    const dashboardItems: SidebarWorkspaceItem[] = loadDashboards().map((dashboard) => ({
      label: dashboard.title,
      href: `/dashboards/${dashboard.id}`,
      meta: dashboard.description ?? "No description",
    }))

    return {
      dashboardItems,
      documentItems,
      themeItems: [] as SidebarWorkspaceItem[],
    }
  }, [])
}
