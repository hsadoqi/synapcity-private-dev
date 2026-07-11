import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react"

export const contextPanelNavigationSections = [
  {
    title: "Dashboard",
    icon: SquareTerminal,
    isActive: true,
    items: ["Overview", "Analytics", "Reports"],
  },
  {
    title: "AI Tools",
    icon: Bot,
    items: ["Assistant", "Models"],
  },
  {
    title: "Documentation",
    icon: BookOpen,
    items: ["Getting Started", "API Reference", "Guides"],
  },
  {
    title: "Settings",
    icon: Settings2,
    items: ["Profile", "Preferences"],
  },
]
