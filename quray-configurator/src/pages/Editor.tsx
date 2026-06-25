import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FanCanvas } from '@/components/editor/FanCanvas'
import { ZoneSettings } from '@/components/editor/ZoneSettings'
import { createDefaultMapping } from '@/components/editor/zoneMappings'
import { Toast } from '@/components/ui/Toast'
import { ZONE_PALETTE } from '@/constants/zonePalette'
import { findEditorPreset } from '@/data/editorPresets'
import { useEditorZones } from '@/context/EditorZonesContext'
import { useDeviceContext } from '@/context/DeviceContext'
import { usePresetsContext } from '@/context/PresetsContext'
import { editorToolbarClassName } from '@/components/library/LibraryToolbar'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import type { EditorZone, GesturePosition, Preset, PresetZone } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function Editor() {
  const { presetId } = useParams<{ presetId: string }>()
  const navigate = useNavigate()
  const { sendPresetToDevice } = useDeviceContext()
  const {
    setFreshPresets,
    setFullPresets,
    addRecentPreset,
  } = usePresetsContext()
  const location = useLocation()
  const editorPreset = findEditorPreset(presetId ?? 'preset-empty')
  const {
    zones,
    commitZones,
    resetZones,
    selectedZoneId,
    setSelectedZoneId,
    openZoneContextMenu,
    toast,
    dismissToast,
    setToast,
    presetScale,
    presetRoot,
    presetOctave,
    undo,
    redo,
    canUndo,
    canRedo,
    presetName,
    setPresetName,
  } = useEditorZones()
  const [drawMode, setDrawMode] = useState(false)

  const zoneIdCounter = useId()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const colorPoolRef = useRef<string[]>(shuffle([...ZONE_PALETTE]))

  const effectiveDrawMode = drawMode || zones.length === 0

  function pickNextZoneColor(): string {
    if (colorPoolRef.current.length === 0) {
      colorPoolRef.current = shuffle([...ZONE_PALETTE])
    }
    return colorPoolRef.current.shift()!
  }

  useEffect(() => {
    // Loading a preset replaces zones without history and clears the undo stack
    // so undo can never cross presets.
    resetZones(editorPreset?.zones ?? [])
    setSelectedZoneId(null)
    setPresetName(location.state?.presetName ?? editorPreset?.name ?? 'New Preset')
    if (presetId && presetId !== 'preset-empty') {
      addRecentPreset(presetId)
    }
  }, [presetId, resetZones, setSelectedZoneId, addRecentPreset])

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
    commitZones(zones, [...zones, newZone], 'Create zone')
    setSelectedZoneId(newZone.id)
    setDrawMode(false)
  }, [zones, zoneIdCounter, commitZones, setSelectedZoneId])

  const handleZoneUpdate = useCallback((id: string, position: GesturePosition) => {
    const target = zones.find(z => z.id === id)
    if (!target) return

    // No-op skip guard: a drag that ends where it started (or a sub-pixel
    // nudge) must not push an empty undo step.
    const [pa, px0, py0, px1, py1] = target.position
    const [na, nx0, ny0, nx1, ny1] = position
    if (pa === na && px0 === nx0 && py0 === ny0 && px1 === nx1 && py1 === ny1) {
      return
    }

    const after = zones.map(z => (z.id === id ? { ...z, position } : z))
    commitZones(zones, after, 'Move/resize zone')
  }, [zones, commitZones])

  const handleZonePatch = useCallback((
    id: string,
    patch: Partial<Pick<EditorZone, 'name' | 'color' | 'type' | 'active' | 'locked'>>,
  ) => {
    const after = zones.map(z => (z.id === id ? { ...z, ...patch } : z))
    commitZones(zones, after, 'Edit zone')
  }, [zones, commitZones])

  const outlinedButtonClassName = libraryOutlinedButtonClassName()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className={`shrink-0 ${editorToolbarClassName()}`}>
            <div className="flex h-12 items-center -mx-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={() => {
                    const hasAnyMappings = zones.some(z => z.mappings.length > 0)
                    if (!hasAnyMappings) {
                      setToast({ message: 'No mappings assigned. Add at least one mapping before syncing.' })
                      return
                    }

                    // Save preset to library before navigating away
                    const savedId = (!presetId || presetId === 'preset-empty')
                      ? `preset-${Date.now()}`
                      : presetId
                    const presetZones: PresetZone[] = zones.map((zone) => ({
                      id: zone.id,
                      name: zone.name,
                      color: zone.color,
                      outputType: (zone.type ?? zone.mappings[0]?.type ?? 'Note') as PresetZone['outputType'],
                      axis: zone.mappings[0]?.axis ?? 'Y',
                      paramLabel: zone.mappings[0]?.type ?? 'Note',
                    }))
                    const outputTypes = [...new Set(zones.map((z) => z.type).filter(Boolean))] as Preset['outputTypes']
                    const savedPreset: Preset = {
                      id: savedId,
                      name: presetName,
                      devices: [],
                      tags: [],
                      outputTypes,
                      zoneCount: zones.length,
                      zones: presetZones,
                      lastUpdated: new Date().toISOString().split('T')[0],
                      syncStatus: 'not-synced',
                      isFavourite: false,
                    }
                    const isNew = !presetId || presetId === 'preset-empty' || presetId.startsWith('factory-')
                    const updater = (current: Preset[]) => {
                      const exists = current.some((p) => p.id === savedId)
                      return exists
                        ? current.map((p) => (p.id === savedId ? savedPreset : p))
                        : [savedPreset, ...current]
                    }
                    if (isNew) {
                      setFreshPresets(updater)
                    } else {
                      setFullPresets(updater)
                    }
                    addRecentPreset(savedId)

                    sendPresetToDevice(savedId, savedPreset)
                    setToast({
                      message: 'Added to your Quray.',
                      actionLabel: 'View Device page',
                      onAction: () => navigate('/device'),
                    })
                  }}
                >
                  <UploadSimple size={14} weight="regular" className="shrink-0" aria-hidden="true" />
                  Send to Quray
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <ArrowCounterClockwise size={16} weight="regular" className="shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={outlinedButtonClassName}
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <ArrowClockwise size={16} weight="regular" className="shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div ref={canvasContainerRef} className="absolute inset-4 overflow-hidden rounded-2xl border border-border-panel bg-bg-base">
              {/* Scale label */}
              <div className="pointer-events-none absolute left-5 right-4 top-4 z-10 flex items-center">
                <span className="text-sm font-light text-text-secondary opacity-70">
                  {presetScale} · {presetRoot}{presetOctave}
                </span>
              </div>

              <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center">
                {drawMode || zones.length === 0 ? (
                  <div
                    className="pointer-events-none rounded px-3 py-1.5 text-xs font-light"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-text-primary)', opacity: 0.9 }}
                  >
                    Draw mode — drag to create zone
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSelectedZoneId(null); setDrawMode(true) }}
                    className={`${outlinedButtonClassName} pointer-events-auto`}
                  >
                    <Plus size={14} weight="regular" className="shrink-0" aria-hidden="true" />
                    Add zone
                  </button>
                )}
              </div>

              {/* Empty state guidance */}
              {zones.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
                  <p className="text-base font-light text-text-primary">No zones yet</p>
                  <p className="max-w-[240px] text-center text-sm font-light text-text-muted opacity-70">
                    Click and drag on the canvas to draw your first zone, or wave your hand over Quray
                  </p>
                </div>
              )}

              <FanCanvas
                zones={zones}
                selectedZoneId={selectedZoneId}
                drawMode={effectiveDrawMode}
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

