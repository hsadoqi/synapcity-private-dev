"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components"

import { ContextPanelContent } from "./context-panel-content"

type ContextPanelSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContextPanelSheet({
  open,
  onOpenChange,
}: ContextPanelSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(24rem,calc(100vw-1rem))] sm:max-w-md lg:hidden"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Context</SheetTitle>
          <SheetDescription>
            Tools and information for this workspace.
          </SheetDescription>
        </SheetHeader>
        <ContextPanelContent />
      </SheetContent>
    </Sheet>
  )
}
