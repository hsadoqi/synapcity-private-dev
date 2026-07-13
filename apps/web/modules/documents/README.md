# Documents module

Owns the document list and document detail workspace for the V0 document
experience.

Routes:
- /documents
- /documents/[documentId]

## Document detail composition

`document-detail.tsx` handles loading/error/missing states, then renders
`DocumentWorkspace`, which composes:

- `DocumentHeader` — title, metadata, status, more-actions, view/edit toggle
- `DocumentEditorSurface` — canvas chrome (width, borders, toolbar
  placement, read-only presentation); knows nothing about editor internals
- `DocumentEditorPlaceholder` — **the Lexical integration seam.** Everything
  inside (the `<textarea>`, caret-position math, slash-menu wiring) is a
  prototype stand-in and gets replaced wholesale. Callers only depend on
  `value`/`onChange`/focus callbacks/`readOnly`.
- `DocumentToolbar` — every control performs a real edit against the
  plain-text prototype content (bold/italic/underline/strikethrough/code as
  markdown-ish wrapping, heading/list/quote as line prefixes, link
  insertion), via the pure functions in `document-toolbar-actions.ts` and
  the editor placeholder's selection handle. It does **not** reflect live
  selection state (e.g. showing "Bold" as pressed when the caret is already
  inside bold text) — that needs continuous selection tracking a real
  editor provides for free, which is out of scope here.
- `DocumentContextPanel` — document-level context (Outline/Properties/
  Related), registered into the shared context panel via
  `useRegisterContextPanel` for as long as the page is mounted. Outline
  entries are parsed from the same plain-text `content` a real editor would
  replace (`document-context-panel-data.ts`, isolated on purpose so it dies
  cleanly with the rest of the prototype instead of leaking into whatever
  outline model Lexical ends up using).

## Context panel

The context panel is shared app-shell chrome (see
`components/context-panel`), not owned by this module. This module only
publishes what it wants shown there while a document is open; the panel
itself has no document-specific knowledge.

Deliberately deferred (see inline `TODO(lexical-integration)` comments):
- Real rich-text document model, plugins, and serialization
- Persistence beyond the existing local-storage `document-data.ts` service
  (autosave is real localStorage, not simulated — see the comment block at
  the top of the autosave effect in `document-workspace.tsx` for exactly
  what it does and doesn't guarantee, including a documented gap around
  async save races that this synchronous prototype doesn't need to solve)
- Selection/block-level inspector content (depends on Lexical's selection
  model)
- Real backlinks, comments, version history, and AI actions

## Replacement / cleanup list

Every file below is temporary. None of it should be treated as the
long-term architecture — it exists only to make the prototype workspace
usable while Lexical integration happens separately.

- `components/document-editor-placeholder.tsx` — **the Lexical replacement
  seam.** Replace wholesale with the real Lexical integration. Callers
  (`DocumentEditorSurface`, `DocumentToolbar`, `DocumentWorkspace`) depend
  only on its `value`/`onChange`/focus-callback/`readOnly` props and its
  imperative handle (`scrollToLine`/`getSelection`/`setSelection`/`focus`),
  so the swap should not require touching them.
- `components/document-toolbar-actions.ts` — **delete when Lexical
  formatting plugins take over.** These are plain string-splice helpers
  that exist only so the toolbar's controls aren't fake while the textarea
  placeholder is standing in for the real editor. They are not structured
  rich-text state and are not the design for how Lexical formatting will
  work. Do not migrate them into the Lexical toolbar by adapting them to
  operate on serialized text — the Lexical toolbar should call Lexical's
  own mark/node commands from scratch. See the file's header comment for
  the full reasoning.
- `components/document-editor-shell.tsx` — **superseded**, replaced by
  `document-workspace.tsx`. Not imported, exported, or referenced by any
  test — confirmed via repo-wide search. Marked `SUPERSEDED` at the top of
  the file. Kept only because file deletion wasn't approved in the session
  that replaced it; delete after review/approval.
- `components/document-metadata-panel.tsx` — **superseded**, replaced by
  the context panel's Properties tab. Was already unused before this pass.
  Marked `SUPERSEDED` at the top of the file. Kept only because file
  deletion wasn't approved; delete after review/approval.

Autosave (`document-workspace.tsx`) is prototype persistence, not the
approved editor persistence design — see the comment block at the top of
the autosave effect for the full list of what it does and doesn't
guarantee (localStorage-backed, not the planned IndexedDB adapter; no
persisted compare-and-swap revision; no cross-tab stale-write recovery; no
application-level save coordinator). It is expected to be replaced during
the Lexical editor milestone.

Notes:
- This module is intentionally scaffolded and does not yet implement
  persistence beyond local storage or full editor behavior.
