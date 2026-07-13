import type { ElementTransformer, Transformer } from "@lexical/markdown"
import {
  HEADING,
  LINK,
  ORDERED_LIST,
  QUOTE,
  TEXT_FORMAT_TRANSFORMERS,
  UNORDERED_LIST,
} from "@lexical/markdown"
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode"

/**
 * `---` ⇄ horizontal rule. @lexical/markdown ships no HR transformer (the
 * node lives in @lexical/react), so this is the standard implementation.
 */
const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? "---" : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode()
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line)
    } else {
      parentNode.insertBefore(line)
    }
    line.selectNext()
  },
  type: "element",
}

/**
 * Deliberately not `TRANSFORMERS` from @lexical/markdown: the full set
 * includes code-block and checklist transformers whose node dependencies
 * (CodeNode, checklist listitem behavior) are not registered in Phase 1 —
 * MarkdownShortcutPlugin throws on transformers with unregistered
 * dependencies. This list matches EDITOR_NODES exactly.
 */
export const EDITOR_TRANSFORMERS: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  HORIZONTAL_RULE,
  ...TEXT_FORMAT_TRANSFORMERS,
  LINK,
]
