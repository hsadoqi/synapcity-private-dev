import { TooltipProvider } from "@workspace/ui/components/primitives/tooltip"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  )
}
