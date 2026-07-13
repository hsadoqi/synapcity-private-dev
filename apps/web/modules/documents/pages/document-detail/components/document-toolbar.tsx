"use client"

import * as React from "react"
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react"

import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

import type { DocumentEditorPlaceholderHandle } from "./document-editor-placeholder"
import {
  applyBlockPrefix,
  insertLink,
  toggleInlineMark,
  toggleLinePrefix,
  type TextEdit,
} from "./document-toolbar-actions"

const BLOCK_TYPES = [
  { id: "paragraph", label: "Text", prefix: "" },
  { id: "h1", label: "Heading 1", prefix: "# " },
  { id: "h2", label: "Heading 2", prefix: "## " },
  { id: "h3", label: "Heading 3", prefix: "### " },
] as const

interface DocumentToolbarProps {
  isFocused: boolean
  value: string
  onChange: (value: string) => void
  editorRef: React.RefObject<DocumentEditorPlaceholderHandle | null>
}

/**
 * Every control here performs a real edit against the plain-text prototype
 * content (via `document-toolbar-actions.ts` and the editor placeholder's
 * selection handle) — none of them are decorative. What they do not do is
 * reflect live selection state (e.g. highlighting "Bold" when the caret sits
 * inside already-bold text), since that requires continuous selection
 * tracking a real editor provides for free.
 * TODO(lexical-integration): replace these string-splice actions with the
 * editor's real formatting commands; this file and
 * `document-toolbar-actions.ts` should not survive that migration.
 */
export function DocumentToolbar({
  isFocused,
  value,
  onChange,
  editorRef,
}: DocumentToolbarProps) {
  const applyEdit = (edit: TextEdit) => {
    onChange(edit.value)
    requestAnimationFrame(() => {
      editorRef.current?.setSelection(edit.selectionStart, edit.selectionEnd)
    })
  }

  const withSelection = (transform: (start: number, end: number) => TextEdit) => {
    const selection = editorRef.current?.getSelection() ?? { start: 0, end: 0 }
    applyEdit(transform(selection.start, selection.end))
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center gap-1 overflow-x-auto rounded-t-xl border-b bg-background/95 px-2 py-1.5 backdrop-blur transition-opacity duration-200 ease-out supports-backdrop-filter:bg-background/85",
        isFocused ? "opacity-100" : "opacity-60 hover:opacity-100"
      )}
      role="toolbar"
      aria-label="Formatting"
    >
      <div className="flex items-center gap-0.5">
        {BLOCK_TYPES.map((type) => (
          <ToolbarButton
            key={type.id}
            label={type.label}
            wide
            onClick={() => {
              const selection = editorRef.current?.getSelection() ?? {
                start: 0,
                end: 0,
              }
              applyEdit(applyBlockPrefix(value, selection.start, type.prefix))
            }}
          >
            {type.label}
          </ToolbarButton>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarIconButton
        label="Bold"
        onClick={() => withSelection((s, e) => toggleInlineMark(value, s, e, "**"))}
      >
        <Bold />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Italic"
        onClick={() => withSelection((s, e) => toggleInlineMark(value, s, e, "_"))}
      >
        <Italic />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Underline"
        onClick={() =>
          withSelection((s, e) => toggleInlineMark(value, s, e, "<u>", "</u>"))
        }
      >
        <Underline />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Strikethrough"
        onClick={() => withSelection((s, e) => toggleInlineMark(value, s, e, "~~"))}
      >
        <Strikethrough />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Inline code"
        onClick={() => withSelection((s, e) => toggleInlineMark(value, s, e, "`"))}
      >
        <Code />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarIconButton
        label="Bulleted list"
        onClick={() =>
          withSelection((s, e) =>
            toggleLinePrefix(value, s, e, /^-\s/, () => "- ")
          )
        }
      >
        <List />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Numbered list"
        onClick={() =>
          withSelection((s, e) =>
            toggleLinePrefix(
              value,
              s,
              e,
              /^\d+\.\s/,
              (lineIndex) => `${lineIndex + 1}. `
            )
          )
        }
      >
        <ListOrdered />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Quote"
        onClick={() =>
          withSelection((s, e) => toggleLinePrefix(value, s, e, /^>\s/, () => "> "))
        }
      >
        <Quote />
      </ToolbarIconButton>
      <ToolbarIconButton
        label="Link"
        onClick={() => withSelection((s, e) => insertLink(value, s, e))}
      >
        <Link2 />
      </ToolbarIconButton>
    </div>
  )
}

function ToolbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
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
  children,
}: {
  label: string
  onClick: () => void
  wide?: boolean
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
