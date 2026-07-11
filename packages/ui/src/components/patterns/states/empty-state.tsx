"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export interface EmptyStateProps {
  /** Optional icon (typically 40-48px, e.g. a lucide-react icon) */
  icon?: React.ReactNode
  /** Primary message */
  title: string
  /** Helpful explanation */
  description?: string
  /** CTA button or link */
  action?: React.ReactNode
  className?: string
}

/**
 * Shows when a list, table, or section has no content yet. Encourages user
 * action with icon, message, and optional CTA.
 *
 * @example
 * <EmptyState
 *   icon={<FolderIcon className="size-10" />}
 *   title="No documents yet"
 *   description="Create your first document to get started"
 *   action={<Button size="sm">New document</Button>}
 * />
 */
export const EmptyState = React.memo(function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-muted-foreground/60">{icon}</div> : null}
      <h3 className="font-heading text-sm font-medium text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-xs/relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
})
