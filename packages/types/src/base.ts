/**
 * Shared shape for every persisted domain record across Synapcity modules
 * (documents, dashboards, widget instances — and eventually theme records,
 * once theme's own type system settles).
 *
 * Extend this instead of redefining id/createdAt/updatedAt/deletedAt per
 * module. See synapcity-private-dev/ROADMAP.md, Phase 1.
 */
export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

/**
 * Known entity kinds that can be the target of an EntityRef. Extend this
 * union as new record types are added — keep it a closed set rather than
 * a bare `string`, so referencing a non-existent entity type is a type
 * error, not a silent typo.
 */
export type EntityType = "document" | "dashboard" | "widgetInstance"

/**
 * A typed pointer from one record to another — e.g. a widget instance
 * sourcing its content from a document. Formalizes the pattern already
 * present ad hoc as `WidgetInstance.sourceType` / `sourceId`.
 *
 * Deliberately NOT a generic/polymorphic "Node" model. Two concrete entity
 * kinds (document, dashboard) don't justify that abstraction yet — this
 * exists so relationships have one consistent shape once more entity types
 * are added, without forcing every record into one giant node table now.
 */
export interface EntityRef {
  type: EntityType
  id: string
}
