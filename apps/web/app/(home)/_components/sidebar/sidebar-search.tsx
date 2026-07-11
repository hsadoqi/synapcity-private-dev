"use client"

import { Search } from "lucide-react"

import { Label, SidebarInput } from "@workspace/ui/components"

export function SidebarSearch() {
  return (
    <form>
      <div className="relative">
        <Label htmlFor="app-sidebar-search" className="sr-only">
          Search objects
        </Label>
        <SidebarInput
          id="app-sidebar-search"
          placeholder="Filter objects"
          className="h-8 pl-7"
        />
        <Search
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </form>
  )
}
