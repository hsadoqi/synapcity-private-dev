import { create } from "zustand"

import type { ModalRequest } from "./types"

function createModalId() {
  return `modal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface ModalStoreState {
  queue: ModalRequest[]
  push: (request: Omit<ModalRequest, "id"> & { id?: string }) => string
  resolve: (id: string, result: boolean) => void
}

export const useModalStore = create<ModalStoreState>((set, get) => ({
  queue: [],

  push: (request) => {
    const id = request.id ?? createModalId()
    set((state) => ({ queue: [...state.queue, { ...request, id }] }))
    return id
  },

  resolve: (id, result) => {
    const request = get().queue.find((item) => item.id === id)
    // If already resolved (e.g. the auto-timeout fires after the user
    // already clicked something), the queue lookup fails and this is a
    // safe no-op rather than a double-resolve.
    request?.resolve(result)
    set((state) => ({ queue: state.queue.filter((item) => item.id !== id) }))
  },
}))
