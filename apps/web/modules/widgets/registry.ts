import type { WidgetDefinition } from "./types"

export const widgetRegistry: WidgetDefinition[] = [
  {
    id: "document-card",
    label: "Document Widget",
    category: "document",
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    defaultConfig: { sourceId: "", title: "Document" },
  },
  {
    id: "text-block",
    label: "Text Widget",
    category: "content",
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 1 },
    defaultConfig: { content: "Add descriptive text here." },
  },
]

export function getWidgetDefinition(widgetType: string) {
  return widgetRegistry.find((widget) => widget.id === widgetType) ?? null
}
