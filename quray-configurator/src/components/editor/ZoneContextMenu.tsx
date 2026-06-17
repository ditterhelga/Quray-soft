import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

type ZoneContextMenuProps = {
  open: boolean
  x: number
  y: number
  menuId: string
  isLocked: boolean
  isActive: boolean
  onDuplicate: () => void
  onDelete: () => void
  onToggleLocked: () => void
  onToggleActive: () => void
  onClose: () => void
}

function ZoneContextMenuDivider() {
  return <div className="my-1 border-t border-border-subtle" role="separator" />
}

export function ZoneContextMenu({
  open,
  x,
  y,
  menuId,
  isLocked,
  isActive,
  onDuplicate,
  onDelete,
  onToggleLocked,
  onToggleActive,
  onClose,
}: ZoneContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return
      }
      onClose()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 50,
      }}
      className="min-w-[220px] animate-[dropdown-enter_150ms_ease-out_both] rounded-lg border border-border-subtle bg-bg-active py-1 shadow-lg"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onDuplicate()
          onClose()
        }}
        className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
      >
        Duplicate
      </button>
      <ZoneContextMenuDivider />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onDelete()
          onClose()
        }}
        className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-status-error transition-colors duration-[120ms] hover:bg-bg-hover"
      >
        Delete
      </button>
      <ZoneContextMenuDivider />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onToggleLocked()
          onClose()
        }}
        className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
      >
        {isLocked ? 'Unlock' : 'Lock'}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onToggleActive()
          onClose()
        }}
        className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>,
    document.body,
  )
}

export function useZoneContextMenuId() {
  return useId()
}
