// Re-exported from the shared package so this stays the import path the
// rest of the module uses (`from "../types"`), without duplicating the
// shape here. Edit the actual definition in packages/types/src/documents.ts
// (source of truth is synapcity-theme; synced to other forks via
// scripts/sync-shared-packages.sh).
export type { DocumentRecord } from "@workspace/types"
