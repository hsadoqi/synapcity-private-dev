"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Label, SidebarInput } from "@workspace/ui/components"

interface SidebarSearchProps {
  onSearchChange?: (query: string) => void
}

export function SidebarSearch({ onSearchChange }: SidebarSearchProps) {
  const [query, setQuery] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearchChange?.(value)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="relative">
        <Label htmlFor="app-sidebar-search" className="sr-only">
          Search objects
        </Label>
        <SidebarInput
          id="app-sidebar-search"
          placeholder="Filter objects"
          className="h-8 pl-7"
          value={query}
          onChange={handleChange}
          aria-describedby="search-results"
        />
        <Search
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </form>
  )
}
