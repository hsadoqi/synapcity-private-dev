import { SidebarProvider } from "@workspace/ui/components/primitives/sidebar"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>{children}</SidebarProvider>
    </div>
  )
}
