import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
} from "lucide-react"

export interface SlashMenuOption {
  id: string
  label: string
  description: string
  icon: typeof Type
  /** Mock insertion — a markdown-ish prefix, not a real block model. */
  insertPrefix: string
}

export const SLASH_MENU_OPTIONS: SlashMenuOption[] = [
  {
    id: "text",
    label: "Text",
    description: "Plain paragraph",
    icon: Type,
    insertPrefix: "",
  },
  {
    id: "heading-1",
    label: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    insertPrefix: "# ",
  },
  {
    id: "heading-2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    insertPrefix: "## ",
  },
  {
    id: "heading-3",
    label: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    insertPrefix: "### ",
  },
  {
    id: "bulleted-list",
    label: "Bulleted list",
    description: "Simple unordered list",
    icon: List,
    insertPrefix: "- ",
  },
  {
    id: "numbered-list",
    label: "Numbered list",
    description: "List with numbering",
    icon: ListOrdered,
    insertPrefix: "1. ",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Callout for a quotation",
    icon: Quote,
    insertPrefix: "> ",
  },
  {
    id: "code",
    label: "Code block",
    description: "Monospaced code snippet",
    icon: Code2,
    insertPrefix: "```\n",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    insertPrefix: "---\n",
  },
]

interface DocumentSlashMenuProps {
  options: SlashMenuOption[]
  activeIndex: number
  onSelect: (option: SlashMenuOption) => void
  style?: React.CSSProperties
}

/**
 * Mock command menu anchored near the caret. Selecting an option inserts a
 * markdown-ish prefix into the placeholder textarea — a stand-in for real
 * block insertion, which depends on Lexical's node model.
 */
export function DocumentSlashMenu({
  options,
  activeIndex,
  onSelect,
  style,
}: DocumentSlashMenuProps) {
  if (options.length === 0) {
    return (
      <div
        style={style}
        className="absolute z-20 w-64 border border-border bg-popover p-3 text-xs text-muted-foreground shadow-md ring-1 ring-foreground/10"
      >
        No matching blocks.
      </div>
    )
  }

  return (
    <div
      style={style}
      role="listbox"
      aria-label="Insert block"
      className="absolute z-20 max-h-72 w-64 overflow-y-auto border border-border bg-popover py-1 shadow-md ring-1 ring-foreground/10"
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          onMouseDown={(event) => {
            // Prevent the textarea from losing focus before we can insert.
            event.preventDefault()
            onSelect(option)
          }}
          className={`flex w-full items-start gap-2.5 px-2.5 py-2 text-left text-xs transition-colors ${
            index === activeIndex
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <option.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <span className="flex flex-col">
            <span className="font-medium">{option.label}</span>
            <span className="text-muted-foreground">{option.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
