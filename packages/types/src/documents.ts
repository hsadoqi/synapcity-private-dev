import type { BaseRecord } from "./base.js"

export interface DocumentRecord extends BaseRecord {
  title: string
  slug: string
  /**
   * Currently a raw string (markdown-ish). Roadmap Phase 4 replaces this
   * with serialized Lexical editor state (JSON) — when that happens, this
   * field's type changes here and every consumer picks it up, instead of
   * each fork migrating its own local copy of DocumentRecord separately.
   */
  content: string
  plainText: string
  summary?: string | null
}
