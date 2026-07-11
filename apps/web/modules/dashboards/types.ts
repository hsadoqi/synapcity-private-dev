// Re-exported from the shared package. WidgetInstance in particular used
// to be defined here AND in modules/widgets/types.ts — now both re-export
// the single definition in packages/types/src/widgets.ts. Edit the actual
// shapes in packages/types/src/{dashboards,widgets}.ts (source of truth is
// synapcity-theme; synced to other forks via scripts/sync-shared-packages.sh).
export type {
  DashboardRecord,
  DashboardLayoutItem,
  DashboardLayout,
  WidgetInstance,
} from "@workspace/types"
