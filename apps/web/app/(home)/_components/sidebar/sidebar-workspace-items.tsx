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
  useSidebar,
} from "@workspace/ui/components"

import type { SidebarWorkspaceItem } from "./use-sidebar-workspace-items"

type SidebarWorkspaceItemsProps = {
  activeSection: "Dashboards" | "Documents" | "Theme"
  items: SidebarWorkspaceItem[]
}

export function SidebarWorkspaceItems({
  activeSection,
  items,
}: SidebarWorkspaceItemsProps) {
  const pathname = usePathname()
  const { open } = useSidebar()
  const sectionTitle =
    activeSection === "Dashboards"
      ? "Dashboards"
      : activeSection === "Theme"
        ? "Theme"
        : "Documents"
  const emptyStateCopy =
    activeSection === "Theme"
      ? "No theme-specific sidebar items yet."
      : `No ${sectionTitle.toLowerCase()} items yet.`
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span className="flex flex-1 items-center justify-between">
          {sectionTitle}
          <Button
            type="button"
            className="translate-x-2"
            variant="ghost"
            aria-label={`Create ${activeSection} is not available yet`}
          >
            <Plus className="size-4 shrink-0" />
          </Button>
        </span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {(items.length === 0 && open) ? (
          <p className="px-2 py-1 text-sm text-sidebar-foreground/60">
            {emptyStateCopy}
          </p>
        ) : (
          <SidebarMenu>
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className="h-auto items-start py-2"
                    >
                      <Link href={item.href}>
                        <FileText className="mt-0.5" aria-hidden="true" />
                        <span className="grid min-w-0 gap-0.5">
                          <span>{item.label}</span>
                          <span className="truncate text-[11px] font-normal text-sidebar-foreground/60">
                            {item.meta}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    {index < items.length - 1 ? <SidebarSeparator /> : null}
                  </SidebarMenuItem>
                ))}
              </div>
            </div>
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
