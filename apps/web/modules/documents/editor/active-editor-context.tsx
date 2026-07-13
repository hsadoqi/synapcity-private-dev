"use client"

import * as React from "react"
import type { LexicalEditor } from "lexical"

/**
 * Publishes the mounted document's LexicalEditor instance to workspace
 * chrome outside the composer (outline navigation now; header undo/redo
 * and the status bar in later phases). `DocumentWorkspace` owns the state
 * and renders the scope; the bridge plugin inside the composer publishes
 * through the setter.
 *
 * Two contexts for the same reason as `context-panel-slot.tsx`: the
 * setter's identity is stable, so publishing the editor never re-renders
 * components that only ever set it.
 */
const ActiveEditorValueContext = React.createContext<
  LexicalEditor | null | undefined
>(undefined)
const ActiveEditorSetterContext = React.createContext<
  ((editor: LexicalEditor | null) => void) | undefined
>(undefined)

export function ActiveEditorScope({
  editor,
  onEditorChange,
  children,
}: {
  editor: LexicalEditor | null
  onEditorChange: (editor: LexicalEditor | null) => void
  children: React.ReactNode
}) {
  return (
    <ActiveEditorSetterContext.Provider value={onEditorChange}>
      <ActiveEditorValueContext.Provider value={editor}>
        {children}
      </ActiveEditorValueContext.Provider>
    </ActiveEditorSetterContext.Provider>
  )
}

/** Null while no editor is mounted (or during the first commit). */
export function useActiveEditor(): LexicalEditor | null {
  const editor = React.useContext(ActiveEditorValueContext)
  if (editor === undefined) {
    throw new Error("useActiveEditor must be used within an ActiveEditorScope")
  }
  return editor
}

export function useSetActiveEditor() {
  const setter = React.useContext(ActiveEditorSetterContext)
  if (!setter) {
    throw new Error(
      "useSetActiveEditor must be used within an ActiveEditorScope"
    )
  }
  return setter
}
