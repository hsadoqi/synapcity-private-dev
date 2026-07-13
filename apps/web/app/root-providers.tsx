"use client"

import { CommandProvider } from "@/components/command/command-context"
import { CommandMenu } from "@/components/command/command-menu"
import { ContextPanelSlotProvider } from "@/components/context-panel"
import { RootThemeProvider } from "@/modules/theme"
import { ModalRenderer, ToastRenderer } from "@workspace/feedback"
import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"
import type { ReactNode } from "react"
import { NavigationFeedback } from "./navigation-feedback"

interface ProvidersProps {
  children: ReactNode
}

export function RootProviders({ children }: ProvidersProps) {
  return (
    <RootThemeProvider>
      <TooltipProvider>
        <CommandProvider>
          <ContextPanelSlotProvider>
            <CommandMenu />
            <NavigationFeedback />
            {children}
            <ToastRenderer />
            <ModalRenderer />
          </ContextPanelSlotProvider>
        </CommandProvider>
      </TooltipProvider>
    </RootThemeProvider>
  )
}
