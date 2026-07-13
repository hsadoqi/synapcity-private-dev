/**
 * DISPOSABLE PROTOTYPE CODE — part of the Lexical replacement boundary,
 * alongside `document-editor-placeholder.tsx`.
 *
 * These are plain string-splice helpers that exist for exactly one reason:
 * to keep the textarea-prototype toolbar controls from being fake while
 * that textarea is still standing in for the real editor. Nothing here is,
 * or should be mistaken for, the future Lexical formatting architecture.
 * Specifically:
 *
 * - This is NOT structured rich-text state. There are no nodes, no marks,
 *   no schema — just regex/substring manipulation of one flat string.
 * - This is NOT the design for how formatting commands will work once
 *   Lexical is wired in. Lexical expresses bold/italic/headings/lists as
 *   editor state transforms (commands over a node tree with a real
 *   selection model), not text splicing.
 * - This file must be DELETED, not migrated, when
 *   `document-editor-placeholder.tsx` is replaced with the real Lexical
 *   integration. Do not port these functions into the Lexical toolbar by
 *   adapting them to operate on serialized text — that would smuggle
 *   string-manipulation formatting into an architecture that specifically
 *   exists to avoid it. The Lexical toolbar should call Lexical's own
 *   mark/node commands from scratch.
 * - Every caller of these functions (`document-toolbar.tsx`) goes away in
 *   the same swap, since the toolbar itself becomes a thin wrapper over
 *   Lexical's selection/command API.
 *
 * These operate on the plain-string `content` the textarea prototype uses
 * today. They intentionally do not attempt to track "is the caret currently
 * inside bold text" — that requires continuous selection inspection a real
 * editor provides for free. TODO(lexical-integration): delete this file
 * entirely and replace with the editor's own mark/node commands.
 */

export interface TextEdit {
  value: string
  selectionStart: number
  selectionEnd: number
}

/** Toggle an inline mark (e.g. `**bold**`, or `<u>` / `</u>`) around the
 * selection. `close` defaults to `open` for symmetric tokens. */
export function toggleInlineMark(
  value: string,
  start: number,
  end: number,
  open: string,
  close: string = open
): TextEdit {
  const hasWrap =
    value.slice(Math.max(0, start - open.length), start) === open &&
    value.slice(end, end + close.length) === close

  if (hasWrap) {
    const newValue =
      value.slice(0, start - open.length) +
      value.slice(start, end) +
      value.slice(end + close.length)
    return {
      value: newValue,
      selectionStart: start - open.length,
      selectionEnd: end - open.length,
    }
  }

  const selected = value.slice(start, end)
  const newValue =
    value.slice(0, start) + open + selected + close + value.slice(end)

  return {
    value: newValue,
    selectionStart: start + open.length,
    selectionEnd: end + open.length,
  }
}

function getLineBounds(value: string, index: number) {
  const lineStart = value.lastIndexOf("\n", index - 1) + 1
  const nextBreak = value.indexOf("\n", index)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  return { lineStart, lineEnd }
}

const HEADING_PREFIX_PATTERN = /^#{1,6}\s*/

/** Replace the heading marker on the caret's current line. `prefix` is
 * `"# "`, `"## "`, `"### "`, or `""` for plain paragraph text. */
export function applyBlockPrefix(
  value: string,
  caretIndex: number,
  prefix: string
): TextEdit {
  const { lineStart, lineEnd } = getLineBounds(value, caretIndex)
  const line = value.slice(lineStart, lineEnd)
  const stripped = line.replace(HEADING_PREFIX_PATTERN, "")
  const nextLine = prefix + stripped

  return {
    value: value.slice(0, lineStart) + nextLine + value.slice(lineEnd),
    selectionStart: lineStart + nextLine.length,
    selectionEnd: lineStart + nextLine.length,
  }
}

/**
 * Toggle a per-line prefix (bulleted list, numbered list, quote) across
 * every line spanned by the selection (or just the caret's line if there is
 * no selection). If every spanned line already carries the prefix, it is
 * removed from all of them; otherwise it is added to lines missing it.
 */
export function toggleLinePrefix(
  value: string,
  start: number,
  end: number,
  matcher: RegExp,
  makePrefix: (lineIndexInBlock: number) => string
): TextEdit {
  const blockStart = getLineBounds(value, start).lineStart
  const blockEnd = getLineBounds(value, Math.max(end - 1, start)).lineEnd
  const block = value.slice(blockStart, blockEnd)
  const lines = block.length ? block.split("\n") : [""]

  const allPrefixed = lines.every((line) => matcher.test(line))

  const nextLines = lines.map((line, index) => {
    if (allPrefixed) {
      return line.replace(matcher, "")
    }
    if (matcher.test(line)) {
      return line
    }
    return makePrefix(index) + line
  })

  const nextBlock = nextLines.join("\n")

  return {
    value: value.slice(0, blockStart) + nextBlock + value.slice(blockEnd),
    selectionStart: blockStart,
    selectionEnd: blockStart + nextBlock.length,
  }
}

/**
 * Insert (or wrap the selection in) markdown link syntax, leaving the URL
 * portion selected so the user can immediately type or paste over it.
 */
export function insertLink(value: string, start: number, end: number): TextEdit {
  const selected = value.slice(start, end)
  const label = selected || "link text"
  const url = "https://"
  const insertion = `[${label}](${url})`
  const newValue = value.slice(0, start) + insertion + value.slice(end)

  const urlStart = start + `[${label}](`.length
  const urlEnd = urlStart + url.length

  return { value: newValue, selectionStart: urlStart, selectionEnd: urlEnd }
}
