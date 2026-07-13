import type { EditorThemeClasses } from "lexical"

/**
 * Maps Lexical node types to the classes defined in `editor-content.css`
 * (scoped under `.document-workspace`, ADR-1 — no Tailwind utilities here
 * so the entire content look lives in one stylesheet next to its tokens).
 */
export const EDITOR_THEME: EditorThemeClasses = {
  paragraph: "editor-p",
  heading: {
    h1: "editor-h1",
    h2: "editor-h2",
    h3: "editor-h3",
    h4: "editor-h3",
    h5: "editor-h3",
    h6: "editor-h3",
  },
  quote: "editor-quote",
  list: {
    ul: "editor-ul",
    ol: "editor-ol",
    listitem: "editor-li",
    nested: {
      listitem: "editor-li-nested",
    },
  },
  link: "editor-link",
  hr: "editor-hr",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underline-strikethrough",
    code: "editor-text-code",
  },
}
