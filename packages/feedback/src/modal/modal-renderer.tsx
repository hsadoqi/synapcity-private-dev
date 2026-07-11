"use client"

import { Button } from "@workspace/ui/components/primitives/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"

import { useModalStore } from "./store"

/**
 * Mount once near the root of the app (see app/root-providers.tsx). Renders
 * at most one modal at a time — the front of the queue — built entirely on
 * the existing Dialog primitive rather than a second dialog implementation.
 * useModal() is how the rest of the app pushes confirm()/alert() requests
 * into it.
 */
export function ModalRenderer() {
  const request = useModalStore((state) => state.queue[0])
  const resolve = useModalStore((state) => state.resolve)

  if (!request) return null

  const handleOpenChange = (open: boolean) => {
    if (open || !request.closeOnBackdrop) return
    resolve(request.id, false)
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={request.closeOnBackdrop}>
        <DialogHeader>
          {request.title ? <DialogTitle>{request.title}</DialogTitle> : null}
          {request.description ? (
            <DialogDescription>{request.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          {request.variant === "confirm" && request.cancelLabel ? (
            <Button variant="outline" onClick={() => resolve(request.id, false)}>
              {request.cancelLabel}
            </Button>
          ) : null}
          <Button
            variant={
              request.confirmVariant === "destructive" ? "destructive" : "default"
            }
            onClick={() => resolve(request.id, true)}
          >
            {request.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
