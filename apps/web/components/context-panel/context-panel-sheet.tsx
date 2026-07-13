"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components"

import { ContextPanelContent } from "./context-panel-content"
import { useContextPanelSlot } from "./context-panel-slot"

type ContextPanelSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContextPanelSheet({
  open,
  onOpenChange,
}: ContextPanelSheetProps) {
  const slot = useContextPanelSlot()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(24rem,calc(100vw-1rem))] flex-col sm:max-w-md lg:hidden"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{slot?.header.title ?? "Context"}</SheetTitle>
          <SheetDescription>
            {slot?.header.description ??
              "Tools and information for this workspace."}
          </SheetDescription>
        </SheetHeader>
        {slot ? slot.body : <ContextPanelContent />}
      </SheetContent>
    </Sheet>
  )
}
