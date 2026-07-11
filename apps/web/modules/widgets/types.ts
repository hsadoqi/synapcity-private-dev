// Re-exported from the shared package — see modules/dashboards/types.ts for
// why WidgetInstance moved here. Edit the actual shapes in
// packages/types/src/widgets.ts (source of truth is synapcity-theme; synced
// to other forks via scripts/sync-shared-packages.sh).
export type {
  WidgetCategory,
  WidgetDefinition,
  WidgetInstance,
} from "@workspace/types"
