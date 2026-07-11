"use client"

import { PanelRightOpen } from "lucide-react"

import { Button } from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

import { ContextPanelContent } from "./context-panel-content"
import { ContextPanelHeader } from "./context-panel-header"
import { contextPanelNavigationSections } from "./context-panel-navigation"

type DesktopContextPanelProps = {
  collapsed: boolean
  onCollapse: () => void
  onExpand: () => void
}

export function DesktopContextPanel({
  collapsed,
  onCollapse,
  onExpand,
}: DesktopContextPanelProps) {
  return (
    <aside
      aria-label="Context panel"
      className={cn(
        "flex size-full min-w-0 flex-col",
        collapsed ? "bg-background text-muted-foreground" : "bg-muted/20"
      )}
    >
      {collapsed ? (

        <div className="flex flex-col items-center justify-start">
          <div className="flex h-12 items-center justify-center">
            <Button
              type="button"
              variant="default"
              size="icon-lg"
              aria-label="Expand context panel"
              onClick={onExpand}
              >
              <PanelRightOpen />
            </Button>
          </div>
          {contextPanelNavigationSections.map((section => (
            <Button
              key={section.title}
              variant="ghost"
              size="icon-lg"
              aria-label="Expand"
              onClick={onExpand}
            >
              <section.icon/>
            </Button>
          )))}
            </div>
      ) : (
        <>
          <ContextPanelHeader onCollapse={onCollapse} />
          <ContextPanelContent />
        </>
      )}
    </aside>
  )
}
