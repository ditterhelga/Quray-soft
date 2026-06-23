import { CaretDown, Plus, SlidersHorizontal } from '@phosphor-icons/react'
import KebabIcon from '@/assets/icons/kebab-icon.svg?react'
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ZoneMappingCard } from '@/components/editor/ZoneMappingCard'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { Divider } from '@/components/ui/Divider'
import { useEditorZones } from '@/context/EditorZonesContext'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import { createMappingId } from '@/components/editor/zoneMappings'
import { ZONE_PALETTE } from '@/constants/zonePalette'
import type { EditorZone } from '@/types'

function zonePanelDividerClassName() {
  return 'border-t border-border-panel'
}

function zoneSectionLabelClassName() {
  return 'mb-3 text-xs uppercase tracking-wide text-text-muted'
}

type ZoneSettingsProps = {
  selectedZoneId: string | null
  zones: EditorZone[]
  onZonePatch: (
    id: string,
    patch: Partial<Pick<EditorZone, 'name' | 'color' | 'type' | 'active' | 'locked'>>,
  ) => void
  onAddZone?: () => void
}

function ZonePanelSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={className}>{children}</section>
}

interface EditableZoneNameHandle {
  startEditing: () => void
}

const EditableZoneName = forwardRef<EditableZoneNameHandle, {
  name: string
  onSave: (name: string) => void
}>(function EditableZoneName({ name, onSave }, ref) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useImperativeHandle(ref, () => ({
    startEditing() {
      setDraft(name)
      setEditing(true)
    },
  }))

  useEffect(() => {
    setDraft(name)
  }, [name])

  const draftRef = useRef(draft)
  draftRef.current = draft
  const editingRef = useRef(editing)
  editingRef.current = editing
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const nameRef = useRef(name)
  nameRef.current = name

  useEffect(() => {
    return () => {
      if (editingRef.current) {
        const trimmed = draftRef.current.trim()
        if (trimmed && trimmed !== nameRef.current) {
          onSaveRef.current(trimmed)
        }
      }
    }
  }, [])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed) {
      onSave(trimmed)
    } else {
      setDraft(name)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') {
            setDraft(name)
            setEditing(false)
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="min-w-0 flex-1 cursor-text truncate text-left text-base text-text-primary"
    >
      {name}
    </button>
  )
})

function ZoneColorPicker({
  color,
  onChange,
}: {
  color: string
  onChange: (color: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function updatePosition() {
      const anchor = containerRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 120),
        zIndex: 50,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  function handleSelect(nextColor: string) {
    onChange(nextColor)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative ml-auto shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? menuId : undefined}
        aria-label="Zone color"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex cursor-pointer items-center gap-2"
      >
        <span
          className="h-[14px] w-[14px] shrink-0 rounded-sm"
          style={{ background: color }}
          aria-hidden="true"
        />
        <CaretDown size={12} weight="regular" className="shrink-0 text-text-muted" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label="Zone color"
          style={menuStyle}
          className="w-[120px] rounded-xl border border-border-subtle bg-bg-elevated p-3 shadow-lg animate-[dropdown-enter_150ms_ease-out_both]"
        >
          <div className="grid grid-cols-3 gap-2">
            {ZONE_PALETTE.map((swatch) => {
              const selected = color === swatch

              return (
                <button
                  key={swatch}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={`Select color ${swatch}`}
                  onClick={() => handleSelect(swatch)}
                  className={`h-[22px] w-[22px] shrink-0 cursor-pointer rounded-full transition-shadow duration-[120ms] ${
                    selected ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ background: swatch }}
                />
              )
            })}
          </div>
          <p className="mt-2 text-[10px] text-text-muted text-center">
            Zone color · Canvas display only
          </p>
        </div>,
        document.body,
      )}
    </div>
  )
}

function ZoneKebabMenu({
  onRename,
  onDuplicate,
  onDelete,
}: {
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) return
      if (menuRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function updatePosition() {
      const anchor = containerRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - 180),
        zIndex: 50,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  function handleItem(action: () => void) {
    setOpen(false)
    action()
  }

  const menuItemClassName =
    'flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover'

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="Zone menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 w-10 cursor-pointer items-center justify-center rounded-lg bg-bg-active transition-colors duration-[120ms] hover:bg-bg-hover ${
          open ? 'bg-bg-hover text-text-primary' : 'text-text-secondary'
        }`}
      >
        <KebabIcon className="block shrink-0" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={menuStyle}
          className="min-w-[180px] animate-[dropdown-enter_150ms_ease-out_both] rounded-lg border border-border-subtle bg-bg-active py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItem(onRename)}
            className={menuItemClassName}
          >
            Rename zone
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItem(onDuplicate)}
            className={menuItemClassName}
          >
            Duplicate zone
          </button>
          <div className="my-1 border-t border-border-subtle" role="separator" />
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItem(onDelete)}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-status-error transition-colors duration-[120ms] hover:bg-bg-hover"
          >
            Delete zone
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}

export function ZoneSettings({
  selectedZoneId,
  zones,
  onZonePatch,
  onAddZone,
}: ZoneSettingsProps) {
  const {
    updateMapping,
    setMappingType,
    addMapping,
    deleteMapping,
    presetScale,
    presetRoot,
    applySplit,
    commitZones,
    deleteZone,
  } = useEditorZones()
  const [openMappingIds, setOpenMappingIds] = useState<Set<string>>(new Set())
  const editableZoneNameRef = useRef<EditableZoneNameHandle>(null)

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null

  useEffect(() => {
    if (selectedZone) {
      setOpenMappingIds(new Set(selectedZone.mappings.map((m) => m.id)))
    } else {
      setOpenMappingIds(new Set())
    }
  }, [selectedZoneId])

  if (!selectedZone) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8">
        <SlidersHorizontal
          size={28}
          weight="light"
          className="text-text-muted opacity-40"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-light text-text-primary">No zone selected</p>
          <p className="max-w-[180px] text-xs font-light leading-relaxed text-text-muted">
            Select a zone on the canvas to configure its output — Note, CC or CV mappings.
          </p>
        </div>
        {onAddZone && (
          <button
            type="button"
            className={libraryOutlinedButtonClassName()}
            onClick={onAddZone}
          >
            <Plus size={14} weight="regular" className="shrink-0" aria-hidden="true" />
            Add zone
          </button>
        )}
      </div>
    )
  }

  const zoneId = selectedZone.id
  const zoneIndex = zones.findIndex((zone) => zone.id === zoneId)

  function handleAddMapping() {
    const newId = addMapping(zoneId)
    setOpenMappingIds((prev) => new Set(prev).add(newId))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ZonePanelSection className="px-5 pb-4">
        <div
          className="flex items-center"
          style={{ paddingTop: '24px', paddingBottom: '8px' }}
        >
          <span className="mr-5 shrink-0 font-mono text-base font-medium text-text-muted">
            {String(zoneIndex + 1).padStart(2, '0')}
          </span>
          <EditableZoneName
            ref={editableZoneNameRef}
            name={selectedZone.name}
            onSave={(name) => onZonePatch(zoneId, { name })}
          />
          <ZoneKebabMenu
            onRename={() => editableZoneNameRef.current?.startEditing()}
            onDuplicate={() => {
              const [active, xMin, yMin, xMax, yMax] = selectedZone.position
              const newXMin = Math.min(1, xMin + 0.03)
              const newXMax = Math.min(1, xMax + 0.03)
              const newId = `zone-${Date.now()}`
              const newZone: EditorZone = {
                id: newId,
                name: `${selectedZone.name} copy`,
                color: selectedZone.color,
                type: selectedZone.type,
                active: true,
                locked: false,
                position: [active, newXMin, yMin, newXMax, yMax],
                mappings: selectedZone.mappings.map((m) => ({
                  ...m,
                  id: createMappingId(),
                })),
              }
              const idx = zones.findIndex((z) => z.id === zoneId)
              const after = [...zones]
              after.splice(idx + 1, 0, newZone)
              commitZones(zones, after, 'Duplicate zone')
            }}
            onDelete={() => deleteZone(zoneId)}
          />
        </div>

        <div className="flex items-center" style={{ marginTop: '20px' }}>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="text-sm font-light text-text-muted">Active</span>
              <ToggleSwitch
                checked={selectedZone.active}
                onChange={(active) => onZonePatch(zoneId, { active })}
              />
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-sm font-light text-text-muted">Lock</span>
              <ToggleSwitch
                checked={selectedZone.locked}
                onChange={(locked) => onZonePatch(zoneId, { locked })}
              />
            </div>
          </div>
          <div className="ml-auto">
            <ZoneColorPicker
              color={selectedZone.color}
              onChange={(nextColor) => onZonePatch(zoneId, { color: nextColor })}
            />
          </div>
        </div>
      </ZonePanelSection>

      <div className="mt-5">
        <Divider />
      </div>

      <ZonePanelSection className="flex flex-1 flex-col px-5 py-4">
        <h3 className={`${zoneSectionLabelClassName()} mt-2 mb-4`}>MAPPINGS</h3>

        <div className="flex flex-col gap-3">
          {selectedZone.mappings.map((mapping) => (
            <ZoneMappingCard
              key={mapping.id}
              mapping={mapping}
              isOpen={openMappingIds.has(mapping.id)}
              onToggle={() =>
                setOpenMappingIds((prev) => {
                  const next = new Set(prev)
                  next.has(mapping.id) ? next.delete(mapping.id) : next.add(mapping.id)
                  return next
                })
              }
              onUpdate={(patch) => updateMapping(zoneId, mapping.id, patch)}
              onTypeChange={(type) => setMappingType(zoneId, mapping.id, type)}
              presetScale={presetScale}
              presetRoot={presetRoot}
              onApplySplit={() => {
                applySplit(zoneId, mapping.id)
                setOpenMappingIds(new Set())
              }}
              onDelete={() => {
                setOpenMappingIds((prev) => {
                  const next = new Set(prev)
                  next.delete(mapping.id)
                  return next
                })
                deleteMapping(zoneId, mapping.id)
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddMapping}
          className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-border-active bg-transparent text-sm font-light text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary"
        >
          + Add mapping
        </button>
      </ZonePanelSection>
    </div>
  )
}
