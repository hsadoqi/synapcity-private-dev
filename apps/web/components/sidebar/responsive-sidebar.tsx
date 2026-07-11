"use client"

import * as React from "react"
import {
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components"

const navItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Overview", url: "#" },
      { title: "Analytics", url: "#" },
      { title: "Reports", url: "#" },
    ],
  },
  {
    title: "AI Tools",
    url: "#",
    icon: Bot,
    items: [
      { title: "Assistant", url: "#" },
      { title: "Models", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Getting Started", url: "#" },
      { title: "API Reference", url: "#" },
      { title: "Guides", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "Profile", url: "#" },
      { title: "Preferences", url: "#" },
    ],
  },
]

function NavMenu({ items }: { items: typeof navItems }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  <item.icon />
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function SidebarFooterContent() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="#" className="flex items-center gap-2">
            <Bell className="size-4" />
            <span>Notifications</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href="#" className="flex items-center gap-2">
            <Settings2 className="size-4" />
            <span>Settings</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function RightSidebar({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-row-reverse">
        {/* Right Sidebar */}
        <Sidebar side="right" collapsible="icon" className="border-l">
          <SidebarHeader>
            <div className="px-2 py-4">
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu items={navItems} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarFooterContent />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-2xl font-bold">Your Content</h1>
            </div>
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default RightSidebar
