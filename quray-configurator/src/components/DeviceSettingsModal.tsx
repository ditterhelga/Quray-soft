import { useEffect } from 'react'

type DeviceSettingsModalProps = {
  open: boolean
  onClose: () => void
}

export function DeviceSettingsModal({ open, onClose }: DeviceSettingsModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/60"
        aria-label="Close device settings"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-settings-title"
        className="relative w-full max-w-md rounded-lg border border-border bg-bg-active p-6 shadow-xl"
      >
        <h2
          id="device-settings-title"
          className="text-base font-normal text-text-primary"
        >
          Device Settings
        </h2>
        <p className="mt-2 text-sm font-light text-text-muted">
          Working area size, firmware, calibration — coming soon
        </p>
      </div>
    </div>
  )
}
