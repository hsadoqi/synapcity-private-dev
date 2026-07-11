"use client"

import { CommandProvider } from "@/components/command/command-context"
import { CommandMenu } from "@/components/command/command-menu"
import { ModalRenderer, ToastRenderer } from "@workspace/feedback"
import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"
import { ThemeProvider } from "@wrksz/themes"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function RootProviders({ children }: ProvidersProps) {
  return (
            <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
    <TooltipProvider>
      <CommandProvider>
        <CommandMenu />
        {children}
        <ToastRenderer />
        <ModalRenderer />
      </CommandProvider>
    </TooltipProvider>
        </ThemeProvider>
  )
}
