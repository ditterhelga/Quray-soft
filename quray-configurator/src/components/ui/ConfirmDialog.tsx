import { useEffect } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function confirmDialogCancelClassName() {
  return 'inline-flex h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-light text-text-secondary transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary'
}

export function confirmDialogConfirmClassName(destructive = false) {
  return `inline-flex h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-light transition-colors duration-[120ms] ${
    destructive
      ? 'bg-status-error/10 text-status-error hover:bg-status-error/20'
      : 'bg-accent text-text-primary hover:brightness-110'
  }`
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/60"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-lg border border-border bg-bg-active p-6 shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-base font-normal text-text-primary"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm font-light text-text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className={confirmDialogCancelClassName()}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmDialogConfirmClassName(destructive)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
