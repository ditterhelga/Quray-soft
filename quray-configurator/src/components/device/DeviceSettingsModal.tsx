import { X, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MIDI_DEVICES } from '@/components/editor/midiDevices'

type DeviceSettingsModalProps = {
  open: boolean
  firmwareVersion: string
  onClose: () => void
}

export function DeviceSettingsModal({ open, firmwareVersion, onClose }: DeviceSettingsModalProps) {
  const [height, setHeight] = useState(30)
  const [deviceSearch, setDeviceSearch] = useState('')
  const [connectedDevices, setConnectedDevices] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const filteredDevices = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase()
    if (!q) return MIDI_DEVICES
    return MIDI_DEVICES.filter((d) => d.name.toLowerCase().includes(q))
  }, [deviceSearch])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Device settings"
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-bg-active shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-light text-text-primary">Device settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-primary"
            aria-label="Close"
          >
            <X size={16} weight="regular" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-5">

          <div className="flex flex-col gap-3">
            <label className="text-sm font-light text-text-secondary">
              Active sensing height
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10}
                max={100}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-14 shrink-0 text-right text-sm font-light text-text-primary">
                {height} cm
              </span>
            </div>
            <p className="text-xs font-light text-text-muted">
              Maximum hand distance detected above the device
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-light text-text-secondary">Connected devices</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-base px-3 py-2">
              <MagnifyingGlass size={14} className="shrink-0 text-text-muted" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search devices…"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-light text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>

            {connectedDevices.length > 0 && (
              <div className="flex flex-col gap-1">
                {connectedDevices.map((id) => {
                  const device = MIDI_DEVICES.find((d) => d.id === id)
                  if (!device) return null
                  return (
                    <div key={id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg-hover">
                      <span className="text-sm font-light text-text-primary">{device.name}</span>
                      <button
                        type="button"
                        onClick={() => setConnectedDevices((prev) => prev.filter((d) => d !== id))}
                        className="text-text-muted hover:text-status-error"
                        aria-label={`Remove ${device.name}`}
                      >
                        <Trash size={14} weight="regular" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {deviceSearch && (
              <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-bg-base py-1">
                {filteredDevices.length === 0 ? (
                  <p className="px-3 py-2 text-sm font-light text-text-muted">No devices found</p>
                ) : (
                  filteredDevices
                    .filter((d) => !connectedDevices.includes(d.id))
                    .slice(0, 6)
                    .map((device) => (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => {
                          setConnectedDevices((prev) => [...prev, device.id])
                          setDeviceSearch('')
                        }}
                        className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm font-light text-text-primary hover:bg-bg-hover"
                      >
                        {device.name}
                      </button>
                    ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-light text-text-muted">Firmware</span>
            <span className="text-xs font-light text-text-primary">v{firmwareVersion}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
