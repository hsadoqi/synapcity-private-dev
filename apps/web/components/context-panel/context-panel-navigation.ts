import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react"

export const contextPanelNavigationSections = [
  {
    label: "Dashboard",
    icon: SquareTerminal,
    isActive: true,
    items: ["Overview", "Analytics", "Reports"],
  },
  {
    label: "AI Tools",
    icon: Bot,
    isActive: true,
    items: ["Assistant", "Models"],
  },
  {
    label: "Documentation",
    icon: BookOpen,
    isActive: false,
    items: ["Getting Started", "API Reference", "Guides"],
  },
  {
    label: "Settings",
    icon: Settings2,
    isActive: false,
    items: ["Profile", "Preferences"],
  },
]
