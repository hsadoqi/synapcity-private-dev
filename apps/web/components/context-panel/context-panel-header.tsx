import * as React from "react"
import { PanelRightClose } from "lucide-react"

import { Button } from "@workspace/ui/components"

export function ContextPanelHeader({
  title = "Context",
  description = "Tools for this workspace",
  onCollapse,
}: {
  title?: string
  description?: string
  onCollapse?: () => void
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <p className="truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      {onCollapse ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Collapse context panel"
          onClick={onCollapse}
        >
          <PanelRightClose />
        </Button>
      ) : null}
    </div>
  )
}
