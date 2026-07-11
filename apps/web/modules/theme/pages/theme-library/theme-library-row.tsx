"use client"

import * as React from "react"
import {
  Copy,
  Edit3,
  Ellipsis,
  Info,
  PencilLine,
  Trash2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"

import type { ThemeLibraryRowModel } from "./theme-library-model"

type ThemeLibraryRowProps = {
  row: ThemeLibraryRowModel
  onDelete: (themeId: string) => void
  onDuplicate: (themeId: string) => void
  onOpen: (themeId: string) => void
  onRename: (themeId: string) => void
  onUsage?: (themeId: string) => void
}

export function ThemeLibraryRow({
  row,
  onDelete,
  onDuplicate,
  onOpen,
  onRename,
  onUsage,
}: ThemeLibraryRowProps) {
  const { theme } = row

  return (
    <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_2.5rem] items-stretch border-b border-border last:border-b-0">
      <button
        type="button"
        aria-label={`Open ${theme.name}`}
        onClick={() => onOpen(theme.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onOpen(theme.id)
          }
        }}
        className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)_8.5rem_5.5rem] items-center gap-4 px-3 py-2 text-left outline-none transition-colors hover:bg-muted/55 focus-visible:bg-muted focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_6rem]"
      >
        <span
          aria-label={row.palette.accessibleLabel}
          className="flex h-7 w-16 overflow-hidden border border-border bg-muted md:w-20"
        >
          {row.palette.swatches.map((swatch) => (
            <span
              key={swatch.role}
              role="presentation"
              className="min-w-0 flex-1"
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {theme.name}
          </span>
          {theme.description ? (
            <span className="hidden truncate text-xs text-muted-foreground sm:block md:max-lg:hidden">
              {theme.description}
            </span>
          ) : null}
        </span>

        <span className="truncate text-xs text-muted-foreground">
          {row.usage.label}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground md:block">
          {row.updatedLabel}
        </span>
      </button>

      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Theme actions for ${theme.name}`}
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => onOpen(theme.id)}>
              <Edit3 />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRename(theme.id)}>
              <PencilLine />
              Rename/details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(theme.id)}>
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onUsage?.(theme.id)}
              disabled={!onUsage}
            >
              <Info />
              Usage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(theme.id)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
