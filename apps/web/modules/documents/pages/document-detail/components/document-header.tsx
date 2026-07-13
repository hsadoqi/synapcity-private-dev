"use client"

import * as React from "react"
import {
  Copy,
  Ellipsis,
  Eye,
  FileText,
  History,
  PencilLine,
  Trash2,
} from "lucide-react"
import { useToast } from "@workspace/feedback"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

import { DocumentStatus, type DocumentSaveState } from "./document-status"

interface DocumentHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  updatedAt: string
  wordCount: number
  saveState: DocumentSaveState
  saveError?: string
  /** True once the editor canvas has focus — the header quiets down. */
  isCompact: boolean
  isReadOnly: boolean
  onToggleReadOnly: () => void
}

/**
 * Title editing here is a prototype affordance (local state, no
 * validation, no collision handling) — real title persistence follows
 * whatever document-data.ts contract the Lexical integration settles on.
 */
export function DocumentHeader({
  title,
  onTitleChange,
  updatedAt,
  wordCount,
  saveState,
  saveError,
  isCompact,
  isReadOnly,
  onToggleReadOnly,
}: DocumentHeaderProps) {
  const toast = useToast()

  // These menu items are real UI (they open, they're keyboard-operable),
  // but the operations behind them do not exist yet — no data is
  // duplicated, no history is recorded, nothing is deleted. Each shows an
  // explicit "not implemented" message rather than a fake success toast
  // ("Duplicated", "Deleted", etc.), and the menu itself labels them
  // "Prototype" so the gap is visible without needing to click first.
  const handleUnavailableAction = (label: string) => {
    toast.info(`${label} is not implemented in this prototype yet.`)
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 transition-[gap] duration-300 ease-out",
        isCompact && "gap-2"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-none border border-border bg-muted/40 text-muted-foreground transition-all duration-300 ease-out",
              isCompact && "size-6"
            )}
            aria-hidden="true"
          >
            <FileText className={cn("size-4", isCompact && "size-3.5")} />
          </div>

          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="document-title-input">
              Document title
            </label>
            <input
              id="document-title-input"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Untitled document"
              className={cn(
                "w-full truncate rounded-none border-0 bg-transparent p-0 font-heading font-semibold tracking-tight text-foreground outline-none",
                "text-2xl md:text-3xl",
                isCompact && "text-xl md:text-2xl",
                "transition-[font-size] duration-300 ease-out",
                "focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={isReadOnly ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={isReadOnly ? "Switch to editing" : "Switch to viewing"}
                aria-pressed={isReadOnly}
                onClick={onToggleReadOnly}
              >
                {isReadOnly ? <Eye /> : <PencilLine />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isReadOnly ? "Viewing — click to edit" : "Editing — click to view"}
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="More document actions"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onSelect={() =>
                  document.getElementById("document-title-input")?.focus()
                }
              >
                <PencilLine />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleUnavailableAction("Duplicate")}
              >
                <Copy />
                Duplicate
                <DropdownMenuShortcut>Prototype</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleUnavailableAction("Version history")}
              >
                <History />
                Version history
                <DropdownMenuShortcut>Prototype</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleUnavailableAction("Delete")}
              >
                <Trash2 />
                Delete
                <DropdownMenuShortcut>Prototype</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          Updated{" "}
          {new Date(updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span aria-hidden="true">·</span>
        <span>{wordCount} words</span>
        {/* Single instance, single live region — deliberately not duplicated
            per breakpoint (an earlier version rendered this twice, hidden
            via responsive classes; screen readers shouldn't have to guess
            which of two "aria-live" regions is the real one). */}
        <DocumentStatus state={saveState} error={saveError} />
      </div>
    </div>
  )
}
