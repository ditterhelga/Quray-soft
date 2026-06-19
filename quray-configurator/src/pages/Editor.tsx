import {
  ArrowClockwise,
  ArrowCounterClockwise,
  DotsThree,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { FanCanvas } from '@/components/editor/FanCanvas'
import { ZoneSettings } from '@/components/editor/ZoneSettings'
import { createDefaultMapping } from '@/components/editor/zoneMappings'
import { Toast } from '@/components/ui/Toast'
import { ZONE_PALETTE } from '@/constants/zonePalette'
import { findEditorPreset } from '@/data/editorPresets'
import { useEditorZones } from '@/context/EditorZonesContext'
import { libraryToolbarClassName } from '@/components/library/LibraryToolbar'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import type { EditorZone, GesturePosition } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function EditorPresetMenuDivider() {
  return <div className="my-1 border-t border-border-subtle" role="separator" />
}

const EDITOR_PRESET_MENU_WIDTH_PX = 220

function EditorPresetKebabMenu({
  outlinedButtonClassName,
}: {
  outlinedButtonClassName: string
}) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function updatePosition() {
      const anchor = containerRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - EDITOR_PRESET_MENU_WIDTH_PX),
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

  useEffect(() => {
    if (!open) return

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

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={menuStyle}
            className="min-w-[220px] animate-[dropdown-enter_150ms_ease-out_both] rounded-lg border border-border-subtle bg-bg-active py-1 shadow-lg"
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
          </div>,
          document.body,
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
    color: ZONE_PALETTE[0],
    type: 'CC',
    active: true,
    locked: false,
    position: [true, 0.0, 0.2, 0.25, 0.9],
    mappings: [{
      id: 'z1-m1',
      type: 'CC',
      channel: 1,
      axis: 'Y',
      cc: 74,
      singleValue: false,
      bottom: 0,
      top: 127,
    }],
  },
  {
    id: 'z2',
    name: 'Root Note',
    color: ZONE_PALETTE[1],
    type: 'Note',
    active: true,
    locked: false,
    position: [true, 0.25, 0.3, 0.55, 1.0],
    mappings: [{
      id: 'z2-m1',
      type: 'Note',
      channel: 1,
      axis: 'Y',
      rootNote: 'C',
      octave: 4,
      split: { enabled: false, mode: 'Linear', steps: 6, xDivisions: 2, yDivisions: 2 },
    }],
  },
  {
    id: 'z3',
    name: 'Sub Octave',
    color: ZONE_PALETTE[2],
    type: 'Note',
    active: true,
    locked: false,
    position: [true, 0.55, 0.1, 0.8, 0.85],
    mappings: [{
      id: 'z3-m1',
      type: 'Note',
      channel: 1,
      axis: 'Y',
      rootNote: 'C',
      octave: 3,
      split: { enabled: false, mode: 'Linear', steps: 6, xDivisions: 2, yDivisions: 2 },
    }],
  },
  {
    id: 'z4',
    name: 'Unmapped',
    color: ZONE_PALETTE[3],
    type: null,
    active: true,
    locked: false,
    position: [true, 0.8, 0.2, 1.0, 0.7],
    mappings: [],
  },
]

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function Editor() {
  const { presetId } = useParams<{ presetId: string }>()
  const editorPreset = findEditorPreset(presetId ?? 'preset-empty')
  const {
    zones,
    setZones,
    selectedZoneId,
    setSelectedZoneId,
    openZoneContextMenu,
    toast,
    dismissToast,
    setToast,
  } = useEditorZones()
  const [drawMode, setDrawMode] = useState(false)

  const zoneIdCounter = useId()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const colorPoolRef = useRef<string[]>(shuffle([...ZONE_PALETTE]))

  function pickNextZoneColor(): string {
    if (colorPoolRef.current.length === 0) {
      colorPoolRef.current = shuffle([...ZONE_PALETTE])
    }
    return colorPoolRef.current.shift()!
  }

  useEffect(() => {
    setZones(editorPreset?.zones ?? [])
    setSelectedZoneId(null)
  }, [presetId, setZones, setSelectedZoneId])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!drawMode) return
      if (canvasContainerRef.current?.contains(e.target as Node)) return
      setDrawMode(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [drawMode])

  const handleZoneSelect = useCallback((id: string | null) => {
    setSelectedZoneId(id)
    if (id !== null) setDrawMode(false)
  }, [setSelectedZoneId])

  const handleZoneCreate = useCallback((position: GesturePosition) => {
    const defaultMapping = createDefaultMapping('Note')
    const newZone: EditorZone = {
      id:       `${zoneIdCounter}-${Date.now()}`,
      name:     `Zone ${zones.length + 1}`,
      color:    pickNextZoneColor(),
      type:     'Note',
      active:   true,
      locked:   false,
      position,
      mappings: [defaultMapping],
    }
    setZones(prev => [...prev, newZone])
    setSelectedZoneId(newZone.id)
    setDrawMode(false)
  }, [zones.length, zoneIdCounter, setZones, setSelectedZoneId])

  const handleZoneUpdate = useCallback((id: string, position: GesturePosition) => {
    setZones(prev =>
      prev.map(z => (z.id === id ? { ...z, position } : z)),
    )
  }, [])

  const handleZonePatch = useCallback((
    id: string,
    patch: Partial<Pick<EditorZone, 'name' | 'color' | 'type' | 'active' | 'locked'>>,
  ) => {
    setZones(prev =>
      prev.map(z => (z.id === id ? { ...z, ...patch } : z)),
    )
  }, [setZones])

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
                    setSelectedZoneId(null)
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
                  onClick={() => {
                    const hasAnyMappings = zones.some(z => z.mappings.length > 0)
                    if (!hasAnyMappings) {
                      setToast({ message: 'No mappings assigned. Add at least one mapping before syncing.' })
                      return
                    }
                    console.log('Send to Quray')
                  }}
                >
                  <UploadSimple size={14} weight="regular" className="shrink-0" aria-hidden="true" />
                  Send to Quray
                </button>
                <EditorPresetKebabMenu outlinedButtonClassName={outlinedButtonClassName} />
              </div>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div ref={canvasContainerRef} className="absolute inset-4 overflow-hidden rounded-2xl border border-border-panel bg-bg-base">
              <FanCanvas
                zones={zones}
                selectedZoneId={selectedZoneId}
                drawMode={drawMode}
                onZoneSelect={handleZoneSelect}
                onZoneCreate={handleZoneCreate}
                onZoneUpdate={handleZoneUpdate}
                onZoneContextMenu={openZoneContextMenu}
              />
              {toast && (
                <Toast
                  message={toast.message}
                  actionLabel={toast.actionLabel}
                  onAction={toast.onAction}
                  onDismiss={dismissToast}
                  positionClassName="absolute top-12 left-1/2 -translate-x-1/2"
                />
              )}
            </div>
          </div>
        </main>
        <aside
          className="flex w-80 shrink-0 flex-col overflow-y-auto border-l"
          style={{
            borderColor: 'var(--color-border-panel)',
            background: 'var(--color-bg-sidebar)',
          }}
        >
          <ZoneSettings
            selectedZoneId={selectedZoneId}
            zones={zones}
            onZonePatch={handleZonePatch}
            onAddZone={() => {
              setSelectedZoneId(null)
              setDrawMode(true)
            }}
          />
        </aside>
      </div>
    </div>
  )
}

