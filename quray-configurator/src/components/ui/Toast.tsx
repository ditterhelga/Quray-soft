import { useEffect } from 'react'

type ToastProps = {
  message: string
  onDismiss: () => void
  durationMs?: number
  actionLabel?: string
  onAction?: () => void
  positionClassName?: string
}

export function toastClassName(hasAction = false, positionClassName?: string) {
  const position = positionClassName ?? 'fixed bottom-8 left-1/2 -translate-x-1/2'
  return `${position} z-50 max-w-md rounded-lg border border-border bg-bg-active px-4 py-3 text-center text-sm font-light text-text-primary shadow-lg ${
    hasAction ? 'pointer-events-auto flex items-center justify-center gap-4' : 'pointer-events-none'
  }`
}

export function toastActionClassName() {
  return 'shrink-0 cursor-pointer text-sm font-light text-text-primary underline decoration-text-muted underline-offset-2 transition-colors duration-[120ms] hover:text-text-secondary'
}

export function Toast({
  message,
  onDismiss,
  durationMs = 4000,
  actionLabel,
  onAction,
  positionClassName,
}: ToastProps) {
  const hasAction = Boolean(actionLabel && onAction)

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss, durationMs, actionLabel])

  function handleAction() {
    onAction?.()
    onDismiss()
  }

  return (
    <div role="status" aria-live="polite" className={toastClassName(hasAction, positionClassName)}>
      <span className="min-w-0">{message}</span>
      {hasAction && (
        <button type="button" onClick={handleAction} className={toastActionClassName()}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
