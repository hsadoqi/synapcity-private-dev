"use client"

import { ThemeRootProvider } from "@/modules/theme"
import { ModalRenderer, ToastRenderer } from "@workspace/feedback"
import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"

export default function RootProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeRootProvider>
      <TooltipProvider>
        {children}
        <ToastRenderer />
        <ModalRenderer />
      </TooltipProvider>
    </ThemeRootProvider>
  )
}
