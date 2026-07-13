"use client"

import * as React from "react"
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react"
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from "lexical"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list"
import {
  $createHeadingNode,
  $createQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"

import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

import { useActiveEditor } from "@/modules/documents/editor/active-editor-context"

const BLOCK_TYPES: { id: string; label: string; tag: HeadingTagType | null }[] =
  [
    { id: "paragraph", label: "P", tag: null },
    { id: "h1", label: "H1", tag: "h1" },
    { id: "h2", label: "H2", tag: "h2" },
    { id: "h3", label: "H3", tag: "h3" },
  ]

/**
 * Interim toolbar between the editor swap and the Phase-5 floating
 * toolbar: every control dispatches a real Lexical command against the
 * active editor. Still no live selection-state reflection (pressed
 * "Bold" when the caret is in bold text) — that arrives with the
 * floating toolbar's selection tracking, same as before the swap.
 *
 * No link button: real link insertion needs URL-input UI, which is
 * Phase-5 scope (the markdown `[label](url)` shortcut still works).
 */
export function DocumentToolbar({ isFocused }: { isFocused: boolean }) {
  const editor = useActiveEditor()
  const disabled = editor === null

  const run = (mutate: () => void) => {
    if (!editor) return
    mutate()
    editor.focus()
  }

  const setBlockType = (tag: HeadingTagType | null) =>
    run(() =>
      editor?.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        $setBlocksType(selection, () =>
          tag ? $createHeadingNode(tag) : $createParagraphNode()
        )
      })
    )

  const setQuote = () =>
    run(() =>
      editor?.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        $setBlocksType(selection, () => $createQuoteNode())
      })
    )

  const formatText = (format: TextFormatType) =>
    run(() => editor?.dispatchCommand(FORMAT_TEXT_COMMAND, format))

  return (
    <div
      className={cn(
        "sticky top-0 z-10 no-scrollbar flex items-center gap-1 overflow-x-auto overscroll-y-contain rounded-t-xl border-b bg-background/95 px-2 py-1.5 backdrop-blur transition-opacity duration-200 ease-out supports-backdrop-filter:bg-background/85",
        isFocused ? "opacity-100" : "opacity-60 hover:opacity-100"
      )}
      role="toolbar"
      aria-label="Formatting"
      // Keep focus (and therefore the Lexical selection the commands
      // target) inside the editor while clicking toolbar controls.
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-0.5">
        {BLOCK_TYPES.map((type) => (
          <ToolbarButton
            key={type.id}
            label={type.label}
            wide
            disabled={disabled}
            onClick={() => setBlockType(type.tag)}
          >
            {type.label}
          </ToolbarButton>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarIconButton
        label="Bold"
        disabled={disabled}
        onClick={() => formatText("bold")}
      >
        <Bold />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Italic"
        disabled={disabled}
        onClick={() => formatText("italic")}
      >
        <Italic />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Underline"
        disabled={disabled}
        onClick={() => formatText("underline")}
      >
        <Underline />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Strikethrough"
        disabled={disabled}
        onClick={() => formatText("strikethrough")}
      >
        <Strikethrough />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Inline code"
        disabled={disabled}
        onClick={() => formatText("code")}
      >
        <Code />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarIconButton
        label="Bulleted list"
        disabled={disabled}
        onClick={() =>
          run(() =>
            editor?.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          )
        }
      >
        <List />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Numbered list"
        disabled={disabled}
        onClick={() =>
          run(() =>
            editor?.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          )
        }
      >
        <ListOrdered />
      </ToolbarIconButton>
      <ToolbarIconButton label="Quote" disabled={disabled} onClick={setQuote}>
        <Quote />
      </ToolbarIconButton>
    </div>
  )
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ToolbarButton({
  label,
  onClick,
  wide,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  wide?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={cn("text-xs", wide && "px-2")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
