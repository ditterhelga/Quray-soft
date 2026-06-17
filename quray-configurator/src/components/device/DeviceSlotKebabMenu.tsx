import { ArrowClockwise, Trash, type Icon } from '@phosphor-icons/react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import KebabIcon from '@/assets/icons/kebab-icon.svg?react'
import { presetRowActionButtonClassName } from '@/components/library/presetRowActions'
import { setKebabMenuPanelSurfaceClassName } from '@/components/library/SetKebabMenu'

type MenuPlacement = 'down' | 'up'

type DeviceSlotKebabMenuItem = {
  id: string
  label: string
  icon: Icon
  destructive?: boolean
  dividerBefore?: boolean
}

const DEVICE_SLOT_KEBAB_MENU_WIDTH_PX = 220

function DeviceSlotKebabMenuItemButton({
  item,
  onSelect,
}: {
  item: DeviceSlotKebabMenuItem
  onSelect: (id: string) => void
}) {
  const IconComponent = item.icon

  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation()
        onSelect(item.id)
      }}
      className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-light transition-colors duration-[120ms] ${
        item.destructive
          ? 'text-status-error hover:bg-status-error/10'
          : 'text-text-primary hover:bg-bg-hover'
      }`}
    >
      <IconComponent
        size={16}
        weight="regular"
        className={`shrink-0 ${item.destructive ? 'text-status-error' : 'text-text-secondary'}`}
        aria-hidden="true"
      />
      {item.label}
    </button>
  )
}

function useMenuPlacement(
  open: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const [placement, setPlacement] = useState<MenuPlacement>('down')

  useEffect(() => {
    if (!open || !containerRef.current) {
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const estimatedMenuHeight = 120
    const spaceBelow = window.innerHeight - rect.bottom

    setPlacement(spaceBelow < estimatedMenuHeight ? 'up' : 'down')
  }, [open, containerRef])

  return placement
}

function usePortalMenuStyle(
  open: boolean,
  anchorRef: RefObject<HTMLDivElement | null>,
  placement: MenuPlacement,
) {
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    if (!open || !anchorRef.current) {
      return
    }

    function updatePosition() {
      const anchor = anchorRef.current
      if (!anchor) {
        return
      }

      const rect = anchor.getBoundingClientRect()
      const left = Math.max(8, rect.right - DEVICE_SLOT_KEBAB_MENU_WIDTH_PX)

      if (placement === 'down') {
        setStyle({
          position: 'fixed',
          top: rect.bottom + 6,
          left,
          zIndex: 50,
        })
        return
      }

      setStyle({
        position: 'fixed',
        top: rect.top - 6,
        left,
        zIndex: 50,
        transform: 'translateY(-100%)',
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, anchorRef, placement])

  return style
}

type DeviceSlotKebabMenuProps = {
  showUpdate: boolean
  forceOpen?: boolean
  onItemSelect?: (actionId: string) => void
}

export function DeviceSlotKebabMenu({
  showUpdate,
  forceOpen = false,
  onItemSelect,
}: DeviceSlotKebabMenuProps) {
  const [open, setOpen] = useState(forceOpen)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isOpen = forceOpen || open
  const placement = useMenuPlacement(isOpen, containerRef)
  const portalStyle = usePortalMenuStyle(isOpen, containerRef, placement)

  const items: DeviceSlotKebabMenuItem[] = [
    ...(showUpdate
      ? [{ id: 'update', label: 'Update', icon: ArrowClockwise }]
      : []),
    {
      id: 'remove',
      label: 'Remove from device',
      icon: Trash,
      destructive: true,
      dividerBefore: showUpdate,
    },
  ]

  useEffect(() => {
    if (!isOpen || forceOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node

      if (containerRef.current?.contains(target)) {
        return
      }

      if (menuRef.current?.contains(target)) {
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
  }, [isOpen, forceOpen])

  useEffect(() => {
    setOpen(forceOpen)
  }, [forceOpen])

  function handleToggle(event: ReactMouseEvent) {
    event.stopPropagation()
    if (!forceOpen) {
      setOpen((value) => !value)
    }
  }

  function handleSelect(actionId: string) {
    if (!forceOpen) {
      setOpen(false)
    }

    onItemSelect?.(actionId)
  }

  const portalAnimationClassName =
    placement === 'down'
      ? 'animate-[dropdown-enter_150ms_ease-out_both]'
      : 'animate-[dropdown-enter-up_150ms_ease-out_both]'

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        onClick={handleToggle}
        className={`${presetRowActionButtonClassName()} ${isOpen ? 'bg-bg-hover-strong text-text-primary' : ''}`}
        aria-label="Device slot actions"
      >
        <KebabIcon className="block shrink-0" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div ref={menuRef} style={portalStyle} className={portalAnimationClassName}>
            <div
              id={menuId}
              role="menu"
              className={setKebabMenuPanelSurfaceClassName()}
            >
              {items.map((item) => (
                <div key={item.id}>
                  {item.dividerBefore && (
                    <div className="my-1 border-t border-border-subtle" role="separator" />
                  )}
                  <DeviceSlotKebabMenuItemButton item={item} onSelect={handleSelect} />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
