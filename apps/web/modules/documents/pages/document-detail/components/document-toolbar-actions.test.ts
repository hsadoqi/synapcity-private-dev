import { describe, expect, it } from "vitest"

import {
  applyBlockPrefix,
  insertLink,
  toggleInlineMark,
  toggleLinePrefix,
} from "./document-toolbar-actions"

describe("toggleInlineMark", () => {
  it("wraps a selection with the given token", () => {
    const result = toggleInlineMark("hello world", 6, 11, "**")
    expect(result.value).toBe("hello **world**")
    expect(result.selectionStart).toBe(8)
    expect(result.selectionEnd).toBe(13)
  })

  it("unwraps a selection that is already wrapped (toggle off)", () => {
    const result = toggleInlineMark("hello **world**", 8, 13, "**")
    expect(result.value).toBe("hello world")
    expect(result.selectionStart).toBe(6)
    expect(result.selectionEnd).toBe(11)
  })

  it("supports asymmetric open/close tokens (underline)", () => {
    const result = toggleInlineMark("hello world", 6, 11, "<u>", "</u>")
    expect(result.value).toBe("hello <u>world</u>")

    const roundTrip = toggleInlineMark(
      result.value,
      result.selectionStart,
      result.selectionEnd,
      "<u>",
      "</u>"
    )
    expect(roundTrip.value).toBe("hello world")
  })
})

describe("applyBlockPrefix", () => {
  it("adds a heading prefix to the caret's line", () => {
    const result = applyBlockPrefix("hello world", 3, "## ")
    expect(result.value).toBe("## hello world")
  })

  it("replaces an existing heading prefix rather than stacking it", () => {
    const result = applyBlockPrefix("# hello world", 3, "### ")
    expect(result.value).toBe("### hello world")
  })

  it("strips the prefix entirely for the paragraph type", () => {
    const result = applyBlockPrefix("## hello world", 3, "")
    expect(result.value).toBe("hello world")
  })

  it("only affects the caret's own line in a multi-line document", () => {
    const value = "first line\nsecond line\nthird line"
    const caretInSecondLine = value.indexOf("second") + 2
    const result = applyBlockPrefix(value, caretInSecondLine, "# ")
    expect(result.value).toBe("first line\n# second line\nthird line")
  })
})

describe("toggleLinePrefix", () => {
  it("adds a bullet prefix to the caret's line when none exists", () => {
    const result = toggleLinePrefix("todo item", 0, 0, /^-\s/, () => "- ")
    expect(result.value).toBe("- todo item")
  })

  it("removes the prefix when every spanned line already has it (toggle off)", () => {
    const value = "- one\n- two"
    const result = toggleLinePrefix(value, 0, value.length, /^-\s/, () => "- ")
    expect(result.value).toBe("one\ntwo")
  })

  it("numbers lines sequentially for the numbered-list case", () => {
    const value = "first\nsecond\nthird"
    const result = toggleLinePrefix(
      value,
      0,
      value.length,
      /^\d+\.\s/,
      (lineIndex) => `${lineIndex + 1}. `
    )
    expect(result.value).toBe("1. first\n2. second\n3. third")
  })
})

describe("insertLink", () => {
  it("wraps a selection as a markdown link with the URL portion selected", () => {
    const value = "check this out"
    const start = value.indexOf("this")
    const end = start + 4
    const result = insertLink(value, start, end)

    expect(result.value).toBe("check [this](https://) out")
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe(
      "https://"
    )
  })

  it("inserts placeholder link text when nothing is selected", () => {
    const result = insertLink("", 0, 0)
    expect(result.value).toBe("[link text](https://)")
  })
})
