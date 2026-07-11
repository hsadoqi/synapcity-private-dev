import { SidebarInset } from "@workspace/ui/components/primitives/sidebar";
import { AppHeader } from "@/app/(home)/_components/header/app-header";
import { AppSidebar } from "../sidebar/app-sidebar";


export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </>
  )
}
