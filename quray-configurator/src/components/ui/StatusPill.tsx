import { ArrowsClockwise, Plugs } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'

const STATUS_DOT_COLOR = {
  positive: 'bg-status-positive',
  progress: 'bg-status-progress',
  error: 'bg-status-error',
  neutral: 'bg-status-neutral',
} as const

export type StatusPillStatus = keyof typeof STATUS_DOT_COLOR

export type StatusPillMenu = 'connected' | 'calibrated'

type StatusPillProps = {
  label: string
  status: StatusPillStatus
  menu?: StatusPillMenu
}

const MENU_ROW_HOVER =
  'cursor-pointer transition-colors duration-[120ms] hover:bg-bg-hover'

function MenuDivider() {
  return <div className="my-1 border-t border-border-subtle" role="separator" />
}

function ConnectedMenu() {
  return (
    <>
      <div className="px-4 py-2.5 text-sm font-normal text-text-primary">Quray</div>
      <div className="px-4 py-1.5 text-sm font-light text-text-muted">Connection: USB-C</div>
      <div className="px-4 py-1.5 text-sm font-light text-text-muted">Firmware: up to date</div>
      <MenuDivider />
      <button
        type="button"
        role="menuitem"
        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-normal text-text-primary ${MENU_ROW_HOVER}`}
      >
        <Plugs
          size={16}
          weight="regular"
          className="shrink-0 text-text-secondary"
          aria-hidden="true"
        />
        Disconnect
      </button>
    </>
  )
}

function CalibratedMenu() {
  return (
    <>
      <div className="px-4 py-1.5 text-sm font-light text-text-muted">
        Last calibrated: 2h ago
      </div>
      <div className="px-4 py-1.5 text-sm font-light text-text-muted">
        Tracking quality: Good
      </div>
      <MenuDivider />
      <button
        type="button"
        role="menuitem"
        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-normal text-text-primary ${MENU_ROW_HOVER}`}
      >
        <ArrowsClockwise
          size={16}
          weight="regular"
          className="shrink-0 text-text-secondary"
          aria-hidden="true"
        />
        Recalibrate
      </button>
    </>
  )
}

export function StatusPill({ label, status, menu }: StatusPillProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) {
        return
      }
      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={menu ? open : undefined}
        aria-haspopup={menu ? 'menu' : undefined}
        aria-controls={menu && open ? menuId : undefined}
        onClick={() => {
          if (menu) {
            setOpen((prev) => !prev)
          }
        }}
        className={`flex h-8 cursor-pointer items-center gap-3 rounded-lg border border-border px-5 text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover ${
          open ? 'bg-bg-hover' : 'bg-bg-base'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[status]}`}
          aria-hidden="true"
        />
        {label}
      </button>

      {menu && open && (
        <div className="absolute right-0 top-full z-50 min-w-full pt-1.5">
          <div
            id={menuId}
            role="menu"
            className="min-w-[220px] animate-[dropdown-enter_150ms_ease-out_both] rounded-lg border border-border-subtle bg-bg-active py-1 shadow-lg"
          >
            {menu === 'connected' ? <ConnectedMenu /> : <CalibratedMenu />}
          </div>
        </div>
      )}
    </div>
  )
}
