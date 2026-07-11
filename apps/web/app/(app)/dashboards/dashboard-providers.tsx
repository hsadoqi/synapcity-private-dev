import { SidebarProvider } from "@workspace/ui/components/primitives/sidebar";

export const DashboardProviders = ({ children }: {
    children: React.ReactNode;
}) => {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    )
}