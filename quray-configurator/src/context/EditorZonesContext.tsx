import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  applyMappingTypeChange,
  cloneMappings,
  createDefaultMapping,
  createMappingId,
  deriveZoneTypeFromMappings,
  type ZoneMapping,
  type ZoneMappingType,
} from '@/components/editor/zoneMappings'
import { findMidiParameter } from '@/components/editor/midiDevices'
import { ZONE_PALETTE } from '@/constants/zonePalette'
import type { EditorZone, GesturePosition } from '@/types'
import { duplicateZoneRecord } from '@/utils/zoneActions'
import { buildScaleNotes, distributeNotes } from '@/utils/scales'
import { useUndoHistory } from '@/utils/undoHistory'

function shufflePalette(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type ZoneContextMenuState = {
  zoneId: string
  x: number
  y: number
} | null

type ToastState = {
  message: string
  actionLabel?: string
  onAction?: () => void
} | null

type EditorZonesContextValue = {
  zones: EditorZone[]
  setZones: Dispatch<SetStateAction<EditorZone[]>>
  selectedZoneId: string | null
  setSelectedZoneId: Dispatch<SetStateAction<string | null>>
  updateMapping: (zoneId: string, mappingId: string, patch: Partial<ZoneMapping>) => void
  setMappingType: (zoneId: string, mappingId: string, type: ZoneMappingType) => void
  addMapping: (zoneId: string) => string
  deleteMapping: (zoneId: string, mappingId: string) => void
  duplicateZone: (id: string) => void
  deleteZone: (id: string) => void
  zoneContextMenu: ZoneContextMenuState
  openZoneContextMenu: (zoneId: string, x: number, y: number) => void
  closeZoneContextMenu: () => void
  toast: ToastState
  setToast: Dispatch<SetStateAction<ToastState>>
  dismissToast: () => void
  /** Preset-level scale name, e.g. 'Chromatic', 'Natural Minor'. */
  presetScale: string
  setPresetScale: Dispatch<SetStateAction<string>>
  /** Preset-level root note, e.g. 'C', 'A'. */
  presetRoot: string
  setPresetRoot: Dispatch<SetStateAction<string>>
  presetOctave: number
  setPresetOctave: Dispatch<SetStateAction<number>>
  presetName: string
  setPresetName: Dispatch<SetStateAction<string>>
  renamePresetTrigger: number
  triggerPresetRename: () => void
  applySplit: (zoneId: string, mappingId: string) => void
  myDevices: string[]
  addMyDevice: (deviceId: string) => void
  removeMyDevice: (deviceId: string) => void
  /**
   * Apply a zones change and record it on the undo stack.
   * `before`/`after` are full `zones` content snapshots (no UI state).
   * No command is pushed when `before` and `after` are reference-equal.
   */
  commitZones: (before: EditorZone[], after: EditorZone[], description?: string) => void
  /** Replace zones without recording history and clear the stack (preset load). */
  resetZones: (next: EditorZone[]) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const EditorZonesContext = createContext<EditorZonesContextValue | null>(null)

function deriveZoneName(primaryMapping: ZoneMapping, mappingCount: number): string {
  const extra = mappingCount > 1 ? ` +${mappingCount - 1}` : ''
  let base: string
  switch (primaryMapping.type) {
    case 'Note': {
      const note = `${primaryMapping.rootNote ?? 'C'}${primaryMapping.octave ?? 4}`
      base = primaryMapping.chordMode === 'chord'
        ? `${note} ${primaryMapping.chordType ?? 'Major'}`
        : note
      break
    }
    case 'CC': {
      if (primaryMapping.ccInputMode === 'device' && primaryMapping.ccParamId) {
        const param = findMidiParameter(primaryMapping.ccDeviceId, primaryMapping.ccParamId)
        if (param) { base = param.name; break }
      }
      base = `CC ${primaryMapping.cc ?? 74}`
      break
    }
    case 'CV': {
      const short: Record<string, string> = {
        Pitch: 'Pitch', Continuous: 'Cont', Gate: 'Gate', Trigger: 'Trig',
      }
      base = `CV${primaryMapping.port ?? 1} ${short[primaryMapping.cvMode ?? 'Pitch'] ?? 'Pitch'}`
      break
    }
    case 'CV note': {
      base = `CV${primaryMapping.port ?? 1} ${primaryMapping.rootNote ?? 'C'}${primaryMapping.octave ?? 4}`
      break
    }
    default:
      base = 'Zone'
  }
  return `${base}${extra}`
}

function mappingHasUserInput(mapping: ZoneMapping): boolean {
  switch (mapping.type) {
    case 'Note':
      return mapping.rootNote !== 'C' || (mapping.octave ?? 4) !== 4
    case 'CC':
      if (mapping.ccInputMode === 'device')
        return !!(mapping.ccDeviceId && mapping.ccParamId)
      return (mapping.cc ?? 74) !== 74
    case 'CV':
      return (mapping.port ?? 1) !== 1 || mapping.cvMode !== 'Pitch'
    case 'CV note':
      return mapping.rootNote !== 'C' || (mapping.octave ?? 4) !== 4 || (mapping.port ?? 1) !== 1
    default:
      return false
  }
}

function patchZoneMappings(
  zone: EditorZone,
  updater: (mappings: ZoneMapping[]) => ZoneMapping[],
): EditorZone {
  const mappings = updater(zone.mappings)
  return {
    ...zone,
    mappings,
    type: deriveZoneTypeFromMappings(mappings),
  }
}

export function EditorZonesProvider({
  children,
  initialZones = [],
}: {
  children: ReactNode
  initialZones?: EditorZone[]
}) {
  const [zones, setZones] = useState<EditorZone[]>(initialZones)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [zoneContextMenu, setZoneContextMenu] = useState<ZoneContextMenuState>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [presetScale, setPresetScale] = useState('Chromatic')
  const [presetRoot, setPresetRoot] = useState('C')
  const [presetOctave, setPresetOctave] = useState(4)
  const [myDevices, setMyDevices] = useState<string[]>([])
  const [presetName, setPresetName] = useState('New Preset')
  const [renamePresetTrigger, setRenamePresetTrigger] = useState(0)
  const triggerPresetRename = useCallback(() => {
    setRenamePresetTrigger((prev) => prev + 1)
  }, [])
  const colorPoolRef = useRef<string[]>(shufflePalette([...ZONE_PALETTE]))

  const { push: historyPush, undo, redo, clear: historyClear, replaceLast, canUndo, canRedo } = useUndoHistory(100)

  // Synchronous mirrors of the latest zones/selection. These are updated
  // inside applyZones (NOT via useEffect) so that two commits fired in the same
  // tick read the correct "before" snapshot. Initialised to the first render's
  // values; kept current by every path that mutates zones/selection.
  const zonesRef = useRef<EditorZone[]>(initialZones)
  const selectedZoneIdRef = useRef<string | null>(null)
  const lastMappingEditRef = useRef<{
    zoneId: string
    mappingId: string
    before: EditorZone[]
    timestamp: number
  } | null>(null)
  zonesRef.current = zones
  selectedZoneIdRef.current = selectedZoneId

  /**
   * Apply a zones snapshot and reconcile selection. Updates zonesRef
   * synchronously before the state setters so subsequent reads are fresh.
   * Selection is clamped to an existing zone (or null) — it is never restored
   * from a command, which prevents undo/redo from selecting a deleted zone.
   */
  const applyZones = useCallback((next: EditorZone[]) => {
    zonesRef.current = next
    setZones(next)

    const currentSelection = selectedZoneIdRef.current
    if (currentSelection !== null && !next.some((zone) => zone.id === currentSelection)) {
      selectedZoneIdRef.current = null
      setSelectedZoneId(null)
    }
  }, [])

  /**
   * Apply `after` and push an undo command that restores `before`.
   * No-op (no command) when before/after are reference-equal — callers pass the
   * same array reference back when nothing changed (e.g. an idle drag).
   */
  const commitZones = useCallback(
    (before: EditorZone[], after: EditorZone[], description?: string) => {
      if (before === after) {
        return
      }

      applyZones(after)
      historyPush({
        undo: () => applyZones(before),
        redo: () => applyZones(after),
        description,
      })
    },
    [applyZones, historyPush],
  )

  /** Replace zones without recording history and clear the stack (preset load). */
  const resetZones = useCallback(
    (next: EditorZone[]) => {
      zonesRef.current = next
      setZones(next)
      historyClear()
    },
    [historyClear],
  )

  function pickNextZoneColor(): string {
    if (colorPoolRef.current.length === 0) {
      colorPoolRef.current = shufflePalette([...ZONE_PALETTE])
    }
    return colorPoolRef.current.shift()!
  }

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const addMyDevice = useCallback((deviceId: string) => {
    setMyDevices((prev) => prev.includes(deviceId) ? prev : [...prev, deviceId])
  }, [])

  const removeMyDevice = useCallback((deviceId: string) => {
    setMyDevices((prev) => prev.filter((id) => id !== deviceId))
  }, [])

  const updateMapping = useCallback((
    zoneId: string,
    mappingId: string,
    patch: Partial<ZoneMapping>,
  ) => {
    const before = zonesRef.current
    const after = before.map((zone) => {
      if (zone.id !== zoneId) return zone
      const updatedMappings = zone.mappings.map((mapping) =>
        mapping.id === mappingId ? { ...mapping, ...patch } : mapping,
      )
      const primaryMapping = updatedMappings[0]
      const autoName =
        primaryMapping && mappingHasUserInput(primaryMapping)
          ? deriveZoneName(primaryMapping, updatedMappings.length)
          : null
      return {
        ...zone,
        mappings: updatedMappings,
        type: deriveZoneTypeFromMappings(updatedMappings),
        ...(autoName ? { name: autoName } : {}),
      }
    })

    const now = Date.now()
    const last = lastMappingEditRef.current
    const isSameSession =
      last !== null &&
      last.zoneId === zoneId &&
      last.mappingId === mappingId &&
      now - last.timestamp < 400

    if (isSameSession) {
      applyZones(after)
      replaceLast({
        undo: () => applyZones(last.before),
        redo: () => applyZones(after),
        description: 'Edit mapping',
      })
      lastMappingEditRef.current = { ...last, timestamp: now }
    } else {
      commitZones(before, after, 'Edit mapping')
      lastMappingEditRef.current = { zoneId, mappingId, before, timestamp: now }
    }
  }, [applyZones, commitZones, replaceLast])

  const setMappingType = useCallback((
    zoneId: string,
    mappingId: string,
    type: ZoneMappingType,
  ) => {
    const before = zonesRef.current
    const after = before.map((zone) => {
      if (zone.id !== zoneId) return zone

      const updatedMappings = zone.mappings.map((mapping) =>
        mapping.id === mappingId ? applyMappingTypeChange(mapping, type) : mapping,
      )

      return {
        ...zone,
        mappings: updatedMappings,
        type: deriveZoneTypeFromMappings(updatedMappings),
      }
    })
    commitZones(before, after, 'Change mapping type')
  }, [commitZones])

  const addMapping = useCallback((zoneId: string) => {
    const newMapping = createDefaultMapping()

    const before = zonesRef.current
    const after = before.map((zone) =>
      zone.id === zoneId
        ? patchZoneMappings(zone, (mappings) => [...mappings, newMapping])
        : zone,
    )
    commitZones(before, after, 'Add mapping')

    return newMapping.id
  }, [commitZones])

  const deleteMapping = useCallback((zoneId: string, mappingId: string) => {
    const before = zonesRef.current
    const zone = before.find((entry) => entry.id === zoneId)
    if (!zone) {
      return
    }

    const index = zone.mappings.findIndex((mapping) => mapping.id === mappingId)
    if (index === -1) {
      return
    }

    const after = before.map((entry) =>
      entry.id === zoneId
        ? patchZoneMappings(entry, (mappings) =>
            mappings.filter((mapping) => mapping.id !== mappingId),
          )
        : entry,
    )
    commitZones(before, after, 'Delete mapping')

    setToast({
      message: 'Mapping deleted.',
      actionLabel: 'Undo',
      // Single source of truth: the toast Undo replays the history command,
      // keeping the undo/redo stacks consistent.
      onAction: () => undo(),
    })
  }, [commitZones, undo])

  const duplicateZone = useCallback((id: string) => {
    const before = zonesRef.current
    const sourceIndex = before.findIndex((zone) => zone.id === id)
    if (sourceIndex === -1) {
      return
    }

    const source = before[sourceIndex]
    const newId = `zone-${Date.now()}`
    const duplicate = duplicateZoneRecord(source, newId)

    const after = [...before]
    after.splice(sourceIndex + 1, 0, {
      ...duplicate,
      mappings: cloneMappings(source.mappings),
    })

    commitZones(before, after, 'Duplicate zone')
    setSelectedZoneId(newId)
  }, [commitZones])

  const deleteZone = useCallback((id: string) => {
    const before = zonesRef.current
    const index = before.findIndex((zone) => zone.id === id)
    if (index === -1) {
      return
    }

    const zone = before[index]
    const after = before.filter((entry) => entry.id !== id)

    // applyZones reconciles selection: if the deleted zone was selected it is
    // cleared. No need to touch selection here.
    commitZones(before, after, `Delete ${zone.name}`)

    setToast({
      message: `Deleted ${zone.name}.`,
      actionLabel: 'Undo',
      // Replays the history command so the stacks stay in sync.
      onAction: () => undo(),
    })
  }, [commitZones, undo])

  const openZoneContextMenu = useCallback((zoneId: string, x: number, y: number) => {
    setZoneContextMenu({ zoneId, x, y })
  }, [])

  const closeZoneContextMenu = useCallback(() => {
    setZoneContextMenu(null)
  }, [])

  const applySplit = useCallback((zoneId: string, mappingId: string) => {
    const before = zonesRef.current
    const zone = before.find((z) => z.id === zoneId)
    if (!zone) return

    const mapping = zone.mappings.find((m) => m.id === mappingId)
    if (!mapping || mapping.type !== 'Note') return

    const split = mapping.split
    if (!split?.enabled) return

    const xDiv = split.xDivisions ?? 2
    const yDiv = split.yDivisions ?? 2
    const [, xMin, yMin, xMax, yMax] = zone.position as GesturePosition

    const xStep = (xMax - xMin) / xDiv
    const yStep = (yMax - yMin) / yDiv

    const noteCount = xDiv * yDiv
    const pool = buildScaleNotes(
      presetScale,
      presetRoot,
      mapping.octave ?? presetOctave,
      noteCount * 3,
    )
    const notes = distributeNotes(pool, split.mode, noteCount)

    const newZones: EditorZone[] = []
    let noteIndex = 0

    for (let yi = 0; yi < yDiv; yi++) {
      for (let xi = 0; xi < xDiv; xi++) {
        const cellXMin = xMin + xi * xStep
        const cellXMax = xMin + (xi + 1) * xStep
        const cellYMin = yMin + yi * yStep
        const cellYMax = yMin + (yi + 1) * yStep
        const note = notes[noteIndex] ?? notes[0]
        noteIndex++

        const rootNote = note.replace(/\d+$/, '')
        const octave = parseInt(note.match(/\d+$/)?.[0] ?? '4', 10)

        const newMapping: ZoneMapping = {
          id: createMappingId(),
          type: 'Note',
          channel: mapping.channel,
          axis: mapping.axis,
          rootNote,
          octave,
          split: { enabled: false, mode: 'Linear', xDivisions: 2, yDivisions: 2 },
        }

        newZones.push({
          id: `${zoneId}-split-${xi}-${yi}-${Date.now()}`,
          name: `${note}`,
          color: pickNextZoneColor(),
          type: 'Note',
          active: true,
          locked: false,
          position: [true, cellXMin, cellYMin, cellXMax, cellYMax],
          mappings: [newMapping],
        })
      }
    }

    // Build the concrete result array once and record it. redo replays this
    // exact array (no recompute) so non-deterministic notes/ids stay stable.
    const after = before.flatMap((z) => (z.id === zoneId ? newZones : [z]))
    commitZones(before, after, 'Split zone')
    if (newZones.length > 0) {
      setSelectedZoneId(newZones[0].id)
    }
  }, [presetScale, presetRoot, presetOctave, commitZones])

  return (
    <EditorZonesContext.Provider
      value={{
        zones,
        setZones,
        selectedZoneId,
        setSelectedZoneId,
        updateMapping,
        setMappingType,
        addMapping,
        deleteMapping,
        duplicateZone,
        deleteZone,
        zoneContextMenu,
        openZoneContextMenu,
        closeZoneContextMenu,
        toast,
        setToast,
        dismissToast,
        presetScale,
        setPresetScale,
        presetRoot,
        setPresetRoot,
        presetOctave,
        setPresetOctave,
        presetName,
        setPresetName,
        renamePresetTrigger,
        triggerPresetRename,
        applySplit,
        myDevices,
        addMyDevice,
        removeMyDevice,
        commitZones,
        resetZones,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </EditorZonesContext.Provider>
  )
}

export function useEditorZones() {
  const context = useContext(EditorZonesContext)

  if (!context) {
    throw new Error('useEditorZones must be used within EditorZonesProvider')
  }

  return context
}
