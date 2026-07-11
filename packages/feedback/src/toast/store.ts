import { create } from "zustand"

import type { ToastItem, ToastOptions } from "./types"

const DEFAULT_DURATION = 5000

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface ToastStoreState {
  toasts: ToastItem[]
  timers: Map<string, ReturnType<typeof setTimeout>>
  show: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],
  timers: new Map(),

  show: (options) => {
    const id = options.id ?? createToastId()
    const duration = options.duration ?? DEFAULT_DURATION

    const item: ToastItem = {
      id,
      message: options.message,
      title: options.title,
      intent: options.intent ?? "neutral",
      duration,
      dismissible: options.dismissible ?? true,
      action: options.action,
      createdAt: Date.now(),
    }

    const existingTimer = get().timers.get(id)
    if (existingTimer) clearTimeout(existingTimer)

    set((state) => ({
      toasts: [...state.toasts.filter((toast) => toast.id !== id), item],
    }))

    if (duration > 0) {
      const timer = setTimeout(() => get().dismiss(id), duration)
      get().timers.set(id, timer)
    }

    return id
  },

  dismiss: (id) => {
    const timer = get().timers.get(id)
    if (timer) {
      clearTimeout(timer)
      get().timers.delete(id)
    }
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  dismissAll: () => {
    for (const timer of get().timers.values()) clearTimeout(timer)
    get().timers.clear()
    set({ toasts: [] })
  },
}))
