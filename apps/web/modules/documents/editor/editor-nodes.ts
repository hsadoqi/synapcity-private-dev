import type { Klass, LexicalNode } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"

/**
 * Phase-1 node set (plan §5, ROADMAP editor v1): plain rich text only.
 * Checklist, table, and code nodes arrive with the Phase-5 block work —
 * adding a node type here is a persistence-schema commitment, so the set
 * stays as small as the milestone allows.
 */
export const EDITOR_NODES: Klass<LexicalNode>[] = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
]
