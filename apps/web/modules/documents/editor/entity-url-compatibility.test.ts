import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  createEditor,
} from "lexical"
import { $createLinkNode, $isLinkNode, $toggleLink } from "@lexical/link"
import { describe, expect, it } from "vitest"

import { EDITOR_NODES } from "./editor-nodes"
import { createContentEnvelope, parseDocumentContent } from "./serialization"

/**
 * ADR-4 pre-flight (entity links are Phase-5 scope, not implemented
 * here): entity links will be standard LinkNodes carrying internal
 * `synapcity://` URLs. These tests pin that Lexical's link handling —
 * node serialization, the $toggleLink path behind TOGGLE_LINK_COMMAND,
 * and DOM reconciliation — passes such URLs through untouched. Note the
 * composer's LinkPlugin is mounted WITHOUT `validateUrl`, so no
 * sanitization layer is active; if one is ever added it must allowlist
 * the internal scheme, and a failure here is the signal.
 */
const ENTITY_URL = "synapcity://document/doc-2"

function createHeadlessEditor() {
  return createEditor({
    namespace: "test",
    nodes: EDITOR_NODES,
    onError: (error) => {
      throw error
    },
  })
}

function $readFirstLinkUrl(): string | null {
  const paragraph = $getRoot().getFirstChild()
  if (!$isElementNode(paragraph)) return null
  for (const child of paragraph.getChildren()) {
    if ($isLinkNode(child)) return child.getURL()
  }
  return null
}

describe("synapcity:// URLs through Lexical link handling", () => {
  it("survive LinkNode JSON serialization and re-parse", () => {
    const editor = createHeadlessEditor()
    editor.update(
      () => {
        const link = $createLinkNode(ENTITY_URL)
        link.append($createTextNode("Target document"))
        const paragraph = $createParagraphNode()
        paragraph.append(link)
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )

    const serialized = JSON.stringify(editor.getEditorState().toJSON())
    expect(serialized).toContain(ENTITY_URL)

    const rehydrated = createHeadlessEditor()
    rehydrated.setEditorState(rehydrated.parseEditorState(serialized))

    expect(rehydrated.getEditorState().read($readFirstLinkUrl)).toBe(
      ENTITY_URL
    )
  })

  it("survive the $toggleLink path used by TOGGLE_LINK_COMMAND", () => {
    const editor = createHeadlessEditor()
    editor.update(
      () => {
        const text = $createTextNode("Target document")
        const paragraph = $createParagraphNode()
        paragraph.append(text)
        $getRoot().append(paragraph)
        text.select(0, "Target document".length)
        $toggleLink(ENTITY_URL)
      },
      { discrete: true }
    )

    expect(editor.getEditorState().read($readFirstLinkUrl)).toBe(ENTITY_URL)
  })

  it("survive the persistence envelope round-trip", () => {
    const editor = createHeadlessEditor()
    editor.update(
      () => {
        const link = $createLinkNode(ENTITY_URL)
        link.append($createTextNode("Target document"))
        const paragraph = $createParagraphNode()
        paragraph.append(link)
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )

    const parsed = parseDocumentContent(
      createContentEnvelope(editor.getEditorState().toJSON())
    )
    expect(parsed.kind).toBe("lexical")
    if (parsed.kind !== "lexical") return

    const rehydrated = createHeadlessEditor()
    rehydrated.setEditorState(
      rehydrated.parseEditorState(JSON.stringify(parsed.state))
    )
    expect(rehydrated.getEditorState().read($readFirstLinkUrl)).toBe(
      ENTITY_URL
    )
  })

  it("are sanitized to about:blank in DOM rendering ONLY (known incompatibility, reported)", () => {
    // FINDING (pinned, not fixed here): LinkNode.createDOM/updateDOM run
    // the URL through LinkNode.sanitizeUrl, whose protocol allowlist
    // (http/https/mailto/sms/tel) is module-private in @lexical/link —
    // unknown protocols render href="about:blank". Persistence is NOT
    // affected (exportJSON uses the raw URL; see the passing round-trip
    // tests above). Phase 5 must therefore override the sanitizeUrl
    // instance method via a runtime node replacement ({replace: LinkNode})
    // — which keeps `type: "link"` in persisted JSON, so ADR-4's
    // "no new persisted node types" decision stands — or route clicks
    // without relying on href. If this test starts failing, Lexical
    // changed the sanitizer and the Phase-5 approach should be revisited.
    const editor = createHeadlessEditor()
    const rootElement = document.createElement("div")
    rootElement.contentEditable = "true"
    document.body.appendChild(rootElement)
    editor.setRootElement(rootElement)

    editor.update(
      () => {
        const link = $createLinkNode(ENTITY_URL)
        link.append($createTextNode("Target document"))
        const paragraph = $createParagraphNode()
        paragraph.append(link)
        $getRoot().append(paragraph)
      },
      { discrete: true }
    )

    const anchor = rootElement.querySelector("a")
    expect(anchor?.getAttribute("href")).toBe("about:blank")

    // The node itself still carries the raw URL — sanitization is a
    // render-time concern only.
    expect(editor.getEditorState().read($readFirstLinkUrl)).toBe(ENTITY_URL)

    editor.setRootElement(null)
    rootElement.remove()
  })
})
