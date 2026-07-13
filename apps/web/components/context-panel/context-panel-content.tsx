"use client"

import * as React from "react"
import { Bell, ChevronRight, Settings2 } from "lucide-react"

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ScrollArea,
} from "@workspace/ui/components"

import { contextPanelNavigationSections } from "./context-panel-navigation"

export function ContextPanelContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Context panel navigation" className="p-3">
          <div className="flex flex-col gap-1">
            {contextPanelNavigationSections.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                className="group/context-section"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
                  >
                    <item.icon
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    <span>{item.title}</span>
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/context-section:rotate-90 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l pl-3">
                    {item.items.map((label) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </nav>
      </ScrollArea>

      <div className="flex flex-col gap-1 border-t p-3">
        <Button variant="ghost" className="justify-start px-2">
          <Bell data-icon="inline-start" aria-hidden="true" />
          Notifications
        </Button>
        <Button variant="ghost" className="justify-start px-2">
          <Settings2 data-icon="inline-start" aria-hidden="true" />
          Settings
        </Button>
      </div>
    </div>
  )
}
