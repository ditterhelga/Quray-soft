import {
  Faders,
  Question,
  SignOut,
  User,
  type Icon,
} from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import KebabIcon from '@/assets/icons/kebab-icon.svg?react'

function MenuDivider() {
  return <div className="my-1 border-t border-border-subtle" role="separator" />
}

type AccountMenuItemProps = {
  icon: Icon
  label: string
  onClick?: () => void
}

function AccountMenuItem({ icon: IconComponent, label, onClick }: AccountMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
    >
      <IconComponent
        size={16}
        weight="regular"
        className="shrink-0 text-text-secondary"
        aria-hidden="true"
      />
      {label}
    </button>
  )
}

type AccountMenuProps = {
  onOpenDeviceSettings: () => void
}

export function AccountMenu({ onOpenDeviceSettings }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
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

  function handleItemClick(action?: () => void) {
    setOpen(false)
    action?.()
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-8 w-10 cursor-pointer items-center justify-center rounded-lg bg-bg-active transition-colors duration-[120ms] hover:bg-bg-hover ${
          open ? 'bg-bg-hover text-text-primary' : 'text-text-secondary'
        }`}
        aria-label="Account menu"
      >
        <KebabIcon className="block shrink-0" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 min-w-[var(--width-dropdown)] animate-[dropdown-enter-up_150ms_ease-out_both] rounded-lg border border-border-subtle bg-bg-active py-1 shadow-lg"
        >
          <AccountMenuItem
            icon={User}
            label="Account"
            onClick={() => handleItemClick()}
          />
          <AccountMenuItem
            icon={Faders}
            label="Device settings"
            onClick={() => handleItemClick(onOpenDeviceSettings)}
          />
          <MenuDivider />
          <AccountMenuItem
            icon={Question}
            label="Help"
            onClick={() => handleItemClick()}
          />
          <MenuDivider />
          <AccountMenuItem
            icon={SignOut}
            label="Log out"
            onClick={() => handleItemClick()}
          />
        </div>
      )}
    </div>
  )
}
