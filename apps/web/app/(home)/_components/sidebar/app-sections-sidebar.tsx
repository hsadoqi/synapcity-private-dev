"use client"

import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Button,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@workspace/ui/components"

export const AppSectionsSidebar = ({
  activeSection,
  activeItems,
}: {
  activeSection: string
  activeItems:
    | {
        href: string
        label: string
        meta: string
      }[]
    | string
}) => {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span className="flex flex-1 items-center justify-between">
          {activeSection === "Dashboards" ? "Dashboards" : "Documents"}
          <Button
            className="translate-x-2"
            onClick={() => alert(`New ${activeSection}`)}
            variant="ghost"
          >
            <Plus className="size-4 shrink-0" />
          </Button>
        </span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-2">
              {[...activeItems].map(
                (item, idx) =>
                  typeof item === "object" &&
                  item.label.toLowerCase() !== activeSection.toLowerCase() && (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                        className="h-auto items-start py-2"
                      >
                        <Link href={item.href}>
                          <FileText className="mt-0.5" />
                          <span className="grid min-w-0 gap-0.5">
                            <span>{item.label}</span>
                            <span className="truncate text-[11px] font-normal text-sidebar-foreground/60">
                              {item.meta}
                            </span>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      {idx < activeItems.length && <SidebarSeparator />}
                    </SidebarMenuItem>
                  )
              )}
            </div>
          </div>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
