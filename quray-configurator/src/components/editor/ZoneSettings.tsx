import { CaretDown, Plus } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ZoneMappingCard } from '@/components/editor/ZoneMappingCard'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { useEditorZones } from '@/context/EditorZonesContext'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import type { EditorZone } from '@/types'

const ZONE_PALETTE = [
  '#564FBA',
  '#5E3B93',
  '#913F7E',
  '#A75465',
  '#B45846',
  '#B76D3A',
  '#AC7F39',
  '#647D46',
  '#3E8577',
  '#3E809C',
  '#426AA8',
  '#4955A8',
] as const

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

function EditableZoneName({
  name,
  onSave,
}: {
  name: string
  onSave: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    setDraft(name)
  }, [name])

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
}

function ZoneColorPicker({
  color,
  onChange,
}: {
  color: string
  onChange: (color: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
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

      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label="Zone color"
          className="absolute right-0 top-full z-50 mt-1.5 w-[120px] rounded-xl border border-border-panel bg-bg-elevated p-3 shadow-lg animate-[dropdown-enter_150ms_ease-out_both]"
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
        </div>
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
  } = useEditorZones()
  const [openMappingIds, setOpenMappingIds] = useState<Set<string>>(new Set())

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null

  useEffect(() => {
    setOpenMappingIds(new Set())
  }, [selectedZoneId])

  if (!selectedZone) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-0 px-5 py-4">
        <p className="text-sm text-text-muted">Select a zone to edit</p>
        <p className="mt-2 text-xs text-text-muted">or</p>
        {onAddZone && (
          <button
            type="button"
            className={`mt-3 ${libraryOutlinedButtonClassName()}`}
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
            name={selectedZone.name}
            onSave={(name) => onZonePatch(zoneId, { name })}
          />
          <ZoneColorPicker
            color={selectedZone.color}
            onChange={(nextColor) => onZonePatch(zoneId, { color: nextColor })}
          />
        </div>

        <div className="flex items-center gap-6" style={{ marginTop: '20px' }}>
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
      </ZonePanelSection>

      <div className={`${zonePanelDividerClassName()} mt-5`} />

      <ZonePanelSection className="flex flex-1 flex-col px-5 py-4">
        <h3 className={zoneSectionLabelClassName()}>MAPPINGS</h3>

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
