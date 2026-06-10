import {
  ArrowClockwise,
  ArrowCounterClockwise,
  DotsThree,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { FanCanvas } from '@/components/editor/FanCanvas'
import { libraryToolbarClassName } from '@/components/library/LibraryToolbar'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import type { EditorZone, GesturePosition } from '@/types'

function EditorPresetMenuDivider() {
  return <div className="my-1 border-t border-border" role="separator" />
}

function EditorPresetKebabMenu({
  outlinedButtonClassName,
}: {
  outlinedButtonClassName: string
}) {
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
        className={outlinedButtonClassName}
        aria-label="Preset menu"
      >
        <DotsThree size={16} weight="regular" className="shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 min-w-[220px] animate-[dropdown-enter-up_150ms_ease-out_both] rounded-lg border border-border bg-bg-active py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItemClick(() => console.log('Rename preset'))}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
          >
            Rename preset
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItemClick(() => console.log('Duplicate preset'))}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
          >
            Duplicate preset
          </button>
          <EditorPresetMenuDivider />
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItemClick(() => console.log('Export preset'))}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
          >
            Export preset
          </button>
          <EditorPresetMenuDivider />
          <button
            type="button"
            role="menuitem"
            onClick={() => handleItemClick(() => console.log('Delete preset'))}
            className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-light text-status-error transition-colors duration-[120ms] hover:bg-bg-hover"
          >
            Delete preset
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ZONES: EditorZone[] = [
  {
    id: 'z1',
    name: 'Filter Sweep',
    color: '#5B8EE6',
    type: 'CC',
    position: [true, 0.0, 0.2, 0.25, 0.9],
  },
  {
    id: 'z2',
    name: 'Root Note',
    color: '#7BB15B',
    type: 'Note',
    position: [true, 0.25, 0.3, 0.55, 1.0],
  },
  {
    id: 'z3',
    name: 'Sub Octave',
    color: '#CC9F2C',
    type: 'Note',
    position: [true, 0.55, 0.1, 0.8, 0.85],
  },
  {
    id: 'z4',
    name: 'Unmapped',
    color: '#8D95B2',
    type: null,
    position: [true, 0.8, 0.2, 1.0, 0.7],
  },
]

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function Editor() {
  const [zones, setZones]               = useState<EditorZone[]>(MOCK_ZONES)
  const [selectedZoneId, setSelectedId] = useState<string | null>(null)
  const [drawMode, setDrawMode]         = useState(false)

  const zoneIdCounter = useId()   // stable prefix for generated ids

  const handleZoneSelect = useCallback((id: string | null) => {
    setSelectedId(id)
    if (id !== null) setDrawMode(false)
  }, [])

  const handleZoneCreate = useCallback((position: GesturePosition) => {
    const newZone: EditorZone = {
      id:       `${zoneIdCounter}-${Date.now()}`,
      name:     `Zone ${zones.length + 1}`,
      color:    '#5145F2',
      type:     null,
      position,
    }
    setZones(prev => [...prev, newZone])
    setSelectedId(newZone.id)
    setDrawMode(false)
  }, [zones.length, zoneIdCounter])

  const handleZoneUpdate = useCallback((id: string, position: GesturePosition) => {
    setZones(prev =>
      prev.map(z => (z.id === id ? { ...z, position } : z)),
    )
  }, [])

  const outlinedButtonClassName = libraryOutlinedButtonClassName()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className={`shrink-0 ${libraryToolbarClassName()}`}>
            <div className="flex h-12 items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={() => console.log('Undo')}
                  aria-label="Undo"
                >
                  <ArrowCounterClockwise size={16} weight="regular" className="shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={() => console.log('Redo')}
                  aria-label="Redo"
                >
                  <ArrowClockwise size={16} weight="regular" className="shrink-0" aria-hidden="true" />
                </button>
                <div className="mx-1 h-5 w-px bg-border-panel" aria-hidden="true" />
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={() => {
                    setSelectedId(null)
                    setDrawMode(true)
                  }}
                >
                  <Plus size={14} weight="regular" className="shrink-0" aria-hidden="true" />
                  Add zone
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={() => console.log('Send to Quray')}
                >
                  <UploadSimple size={14} weight="regular" className="shrink-0" aria-hidden="true" />
                  Send to Quray
                </button>
                <EditorPresetKebabMenu outlinedButtonClassName={outlinedButtonClassName} />
              </div>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <FanCanvas
              zones={zones}
              selectedZoneId={selectedZoneId}
              drawMode={drawMode}
              onZoneSelect={handleZoneSelect}
              onZoneCreate={handleZoneCreate}
              onZoneUpdate={handleZoneUpdate}
            />
          </div>
        </main>
        <aside
          className="flex w-80 shrink-0 flex-col overflow-y-auto border-l"
          style={{
            borderColor: 'var(--color-border-panel)',
            background: 'var(--color-bg-sidebar)',
          }}
        >
          <ZoneSettings selectedZoneId={selectedZoneId} zones={zones} />
        </aside>
      </div>
    </div>
  )
}

function ZoneSettings({
  selectedZoneId,
  zones,
}: {
  selectedZoneId: string | null
  zones: EditorZone[]
}) {
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null

  if (!selectedZone) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-4 text-sm text-text-muted">
        Select a zone to edit
      </div>
    )
  }

  return (
    <div className="flex flex-col px-5 py-4">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: selectedZone.color }}
          aria-hidden="true"
        />
        <h2 className="text-base text-text-primary">{selectedZone.name}</h2>
      </div>

      <section className="mt-6">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-text-muted">Mapping</h3>
        <p className="text-sm text-text-muted">Note / CC / CV configuration coming soon.</p>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-text-muted">Axis</h3>
        <p className="text-sm text-text-muted">Y / X / Entry / Exit coming soon.</p>
      </section>
    </div>
  )
}
