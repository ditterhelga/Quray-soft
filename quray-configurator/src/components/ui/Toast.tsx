import { useEffect } from 'react'

type ToastProps = {
  message: string
  onDismiss: () => void
  durationMs?: number
}

export function toastClassName() {
  return 'pointer-events-none fixed bottom-8 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-border bg-bg-active px-4 py-3 text-sm font-light text-text-primary shadow-lg'
}

export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss, durationMs])

  return (
    <div role="status" aria-live="polite" className={toastClassName()}>
      {message}
    </div>
  )
}
