"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface Command {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
}

interface CommandContextType {
  open: boolean
  setOpen: (open: boolean) => void
  commands: Command[]
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
}

const CommandContext = createContext<CommandContextType | undefined>(undefined)

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [commands, setCommands] = useState<Command[]>([])

  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => {
      const exists = prev.find((c) => c.id === command.id)
      if (exists) {
        return prev.map((c) => (c.id === command.id ? command : c))
      }
      return [...prev, command]
    })
  }, [])

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return (
    <CommandContext.Provider
      value={{
        open,
        setOpen,
        commands,
        registerCommand,
        unregisterCommand,
      }}
    >
      {children}
    </CommandContext.Provider>
  )
}

export function useCommand() {
  const context = useContext(CommandContext)
  if (!context) {
    throw new Error("useCommand must be used within CommandProvider")
  }
  return context
}
