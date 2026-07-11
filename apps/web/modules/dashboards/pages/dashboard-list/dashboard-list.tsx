"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"

import { EmptyState, ErrorState } from "@workspace/ui/components"
import { loadDashboards } from "@/modules/dashboards/services/dashboard-data"

import { dashboardListStyles } from "./dashboard-list.styles"

export function DashboardListPage() {
  const dashboardState = React.useMemo(() => {
    try {
      return {
        dashboards: loadDashboards(),
        status: "ready" as const,
      }
    } catch {
      return {
        dashboards: [],
        status: "error" as const,
      }
    }
  }, [])

  return (
    <div className={dashboardListStyles.page}>
      <div className={dashboardListStyles.heading}>
        <p className="text-sm text-muted-foreground">Dashboards</p>
        <h1 className={dashboardListStyles.title}>Dashboard library</h1>
      </div>

      {dashboardState.status === "error" ? (
          <ErrorState
            title="Couldn’t load dashboards"
            description="Your dashboard library could not be read from local storage."
          />
        ) : dashboardState.dashboards.length === 0 ? (
          <EmptyState
            icon={<LayoutDashboard className="size-10" aria-hidden="true" />}
            title="No dashboards yet"
            description="Create your first dashboard to organize widgets and views."
          />
        ) : (
          <div className={dashboardListStyles.list}>
            {dashboardState.dashboards.map((dashboard) => (
              <Link
                key={dashboard.id}
                href={`/dashboards/${dashboard.id}`}
                className={dashboardListStyles.card}
              >
                <div className={dashboardListStyles.cardTitle}>
                  {dashboard.title}
                </div>
                <div className={dashboardListStyles.cardMeta}>
                  /{dashboard.slug}
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
