"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

import {
  DocumentSlashMenu,
  SLASH_MENU_OPTIONS,
  type SlashMenuOption,
} from "./document-slash-menu"

interface DocumentEditorPlaceholderProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export interface DocumentEditorPlaceholderHandle {
  /** Used by the outline tab to jump to a heading — an approximation
   * (line-based scroll) that a real editor would do via node position. */
  scrollToLine: (lineIndex: number) => void
  /** Current selection range, used by the toolbar to apply real edits to
   * the actual selected text rather than performing a purely visual toggle. */
  getSelection: () => { start: number; end: number }
  setSelection: (start: number, end: number) => void
  focus: () => void
}

function findScrollableAncestor(node: HTMLElement): HTMLElement {
  let current = node.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    const canScrollY = /(auto|scroll)/.test(style.overflowY)
    if (canScrollY && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}

// Mirrors the textarea's box model closely enough to estimate caret pixel
// position for the slash-menu mock. This is a prototype approximation, not
// a general-purpose caret tracker.
const MIRROR_STYLE: React.CSSProperties = {
  position: "absolute",
  visibility: "hidden",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  top: 0,
  left: -9999,
}

/**
 * TODO(lexical-integration): this entire component is the seam. Everything
 * inside — the <textarea>, the caret-position math, the slash-menu wiring —
 * gets replaced by the real Lexical editor. `DocumentEditorSurface` only
 * knows about `value`/`onChange`/focus callbacks, so swapping this out
 * should not require touching the surface, header, or toolbar.
 */
export const DocumentEditorPlaceholder = React.forwardRef<
  DocumentEditorPlaceholderHandle,
  DocumentEditorPlaceholderProps
>(function DocumentEditorPlaceholder(
  {
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder = "Start writing, or press “/” for commands…",
    className,
    readOnly = false,
  },
  forwardedRef
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const mirrorRef = React.useRef<HTMLDivElement | null>(null)

  React.useImperativeHandle(forwardedRef, () => ({
    scrollToLine: (lineIndex: number) => {
      const node = textareaRef.current
      if (!node) return

      // The textarea auto-grows to fit its full content (see `resize`
      // below) specifically so it never has its own internal overflow —
      // that's what keeps this from becoming a nested scrolling trap. Which
      // also means `node.scrollTo()` here would be a no-op: there's nothing
      // for the textarea itself to scroll. The page's actual scrolling
      // ancestor (`#primary-content` in the app shell) is what needs to
      // move, so we find it and scroll that instead.
      const scrollParent = findScrollableAncestor(node)
      const computed = window.getComputedStyle(node)
      const lineHeight = Number.parseFloat(computed.lineHeight) || 20

      const nodeRect = node.getBoundingClientRect()
      const parentRect = scrollParent.getBoundingClientRect()
      const nodeOffsetWithinParent =
        nodeRect.top - parentRect.top + scrollParent.scrollTop
      const targetTop = nodeOffsetWithinParent + lineIndex * lineHeight

      node.focus()
      scrollParent.scrollTo({
        top: Math.max(targetTop - scrollParent.clientHeight / 3, 0),
        behavior: "smooth",
      })
    },
    getSelection: () => {
      const node = textareaRef.current
      return {
        start: node?.selectionStart ?? 0,
        end: node?.selectionEnd ?? 0,
      }
    },
    setSelection: (start: number, end: number) => {
      const node = textareaRef.current
      if (!node) return
      node.focus()
      node.setSelectionRange(start, end)
    },
    focus: () => {
      textareaRef.current?.focus()
    },
  }))

  const [slashMenu, setSlashMenu] = React.useState<{
    triggerIndex: number
    query: string
    position: { top: number; left: number }
  } | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Auto-grow the textarea so it reads as a canvas, not a bounded form field.
  const resize = React.useCallback(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = "auto"
    node.style.height = `${Math.max(node.scrollHeight, 320)}px`
  }, [])

  React.useLayoutEffect(() => {
    resize()
  }, [resize, value])

  const filteredOptions = React.useMemo<SlashMenuOption[]>(() => {
    if (!slashMenu) return []
    const query = slashMenu.query.toLowerCase()
    if (!query) return SLASH_MENU_OPTIONS
    return SLASH_MENU_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(query)
    )
  }, [slashMenu])

  const measureCaret = (caretIndex: number) => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return { top: 0, left: 0 }

    const computed = window.getComputedStyle(textarea)
    ;[
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "paddingTop",
      "paddingLeft",
      "paddingRight",
      "borderTopWidth",
      "borderLeftWidth",
    ].forEach((property) => {
      // @ts-expect-error - dynamic style property copy for the mirror
      mirror.style[property] = computed[property as keyof CSSStyleDeclaration]
    })
    mirror.style.width = `${textarea.clientWidth}px`

    const before = value.slice(0, caretIndex)
    mirror.textContent = before
    const marker = document.createElement("span")
    marker.textContent = "​"
    mirror.appendChild(marker)

    return {
      top: marker.offsetTop - textarea.scrollTop,
      left: marker.offsetLeft,
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value
    const caretIndex = event.target.selectionStart ?? nextValue.length
    onChange(nextValue)

    const lineStart = nextValue.lastIndexOf("\n", caretIndex - 1) + 1
    const currentLine = nextValue.slice(lineStart, caretIndex)
    const match = /^\/(\S*)$/.exec(currentLine)

    if (match) {
      setSlashMenu({
        triggerIndex: lineStart,
        query: match[1] ?? "",
        position: measureCaret(caretIndex),
      })
      setActiveIndex(0)
    } else {
      setSlashMenu(null)
    }
  }

  const closeSlashMenu = () => setSlashMenu(null)

  const applyOption = (option: SlashMenuOption) => {
    const textarea = textareaRef.current
    if (!textarea || !slashMenu) return

    const caretIndex = textarea.selectionStart ?? value.length
    const nextValue =
      value.slice(0, slashMenu.triggerIndex) +
      option.insertPrefix +
      value.slice(caretIndex)

    onChange(nextValue)
    closeSlashMenu()

    requestAnimationFrame(() => {
      const cursor = slashMenu.triggerIndex + option.insertPrefix.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!slashMenu) return

    if (event.key === "Escape") {
      event.preventDefault()
      closeSlashMenu()
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) =>
        filteredOptions.length ? (index + 1) % filteredOptions.length : 0
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) =>
        filteredOptions.length
          ? (index - 1 + filteredOptions.length) % filteredOptions.length
          : 0
      )
      return
    }

    if (event.key === "Enter" || event.key === "Tab") {
      if (filteredOptions[activeIndex]) {
        event.preventDefault()
        applyOption(filteredOptions[activeIndex])
      }
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={() => {
          // Let a slash-menu click register before we tear down state.
          window.setTimeout(closeSlashMenu, 120)
          onBlur?.()
        }}
        placeholder={placeholder}
        spellCheck
        readOnly={readOnly}
        aria-label="Document content"
        aria-readonly={readOnly}
        className={cn(
          "w-full resize-none rounded-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70",
          className
        )}
      />

      {slashMenu && (
        <DocumentSlashMenu
          options={filteredOptions}
          activeIndex={activeIndex}
          onSelect={applyOption}
          style={{
            top: slashMenu.position.top + 24,
            left: slashMenu.position.left,
          }}
        />
      )}

      <div ref={mirrorRef} style={MIRROR_STYLE} aria-hidden="true" />
    </div>
  )
})
