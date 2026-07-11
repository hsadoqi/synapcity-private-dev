"use client"

import { CommandProvider } from "@/components/command/command-context"
import { CommandMenu } from "@/components/command/command-menu"
import { RootThemeProvider } from "@/modules/theme"
import { ModalRenderer, ToastRenderer } from "@workspace/feedback"
import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function RootProviders({ children }: ProvidersProps) {
  return (
    <RootThemeProvider>
      <TooltipProvider>
        <CommandProvider>
          <CommandMenu />
          {children}
          <ToastRenderer />
          <ModalRenderer />
        </CommandProvider>
      </TooltipProvider>
    </RootThemeProvider>
  )
}
