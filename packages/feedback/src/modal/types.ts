export interface ConfirmOptions {
  id?: string
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: "default" | "destructive"
  closeOnBackdrop?: boolean
}

export interface AlertOptions {
  id?: string
  title?: string
  description?: string
  confirmLabel?: string
}

export interface ModalRequest {
  id: string
  variant: "confirm" | "alert"
  title?: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  confirmVariant: "default" | "destructive"
  closeOnBackdrop: boolean
  resolve: (result: boolean) => void
}
