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
import type { EditorZone, GesturePosition } from '@/types'
import { duplicateZoneRecord } from '@/utils/zoneActions'
import { buildScaleNotes, distributeNotes } from '@/utils/scales'

const ZONE_PALETTE = [
  '#6C5BD9', '#5E3B93', '#913F7E', '#A75465', '#B45846',
  '#B76D3A', '#AC7F39', '#647D46', '#3E8577', '#3E809C',
  '#426AA8', '#22319F',
] as const

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
  dismissToast: () => void
  /** Preset-level scale name, e.g. 'Chromatic', 'Natural Minor'. */
  presetScale: string
  setPresetScale: Dispatch<SetStateAction<string>>
  /** Preset-level root note, e.g. 'C', 'A'. */
  presetRoot: string
  setPresetRoot: Dispatch<SetStateAction<string>>
  applySplit: (zoneId: string, mappingId: string) => void
}

const EditorZonesContext = createContext<EditorZonesContextValue | null>(null)

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
  const colorPoolRef = useRef<string[]>(shufflePalette([...ZONE_PALETTE]))

  function pickNextZoneColor(): string {
    if (colorPoolRef.current.length === 0) {
      colorPoolRef.current = shufflePalette([...ZONE_PALETTE])
    }
    return colorPoolRef.current.shift()!
  }

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const updateMapping = useCallback((
    zoneId: string,
    mappingId: string,
    patch: Partial<ZoneMapping>,
  ) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id !== zoneId) {
          return zone
        }

        return patchZoneMappings(zone, (mappings) =>
          mappings.map((mapping) =>
            mapping.id === mappingId ? { ...mapping, ...patch } : mapping,
          ),
        )
      }),
    )
  }, [])

  const setMappingType = useCallback((
    zoneId: string,
    mappingId: string,
    type: ZoneMappingType,
  ) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id !== zoneId) {
          return zone
        }

        return patchZoneMappings(zone, (mappings) =>
          mappings.map((mapping) =>
            mapping.id === mappingId ? applyMappingTypeChange(mapping, type) : mapping,
          ),
        )
      }),
    )
  }, [])

  const addMapping = useCallback((zoneId: string) => {
    const newMapping = createDefaultMapping()

    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id !== zoneId) {
          return zone
        }

        return patchZoneMappings(zone, (mappings) => [...mappings, newMapping])
      }),
    )

    return newMapping.id
  }, [])

  const deleteMapping = useCallback((zoneId: string, mappingId: string) => {
    const zone = zones.find((entry) => entry.id === zoneId)
    if (!zone) {
      return
    }

    const index = zone.mappings.findIndex((mapping) => mapping.id === mappingId)
    if (index === -1) {
      return
    }

    const removed = zone.mappings[index]

    setZones((prev) =>
      prev.map((entry) => {
        if (entry.id !== zoneId) {
          return entry
        }

        return patchZoneMappings(entry, (mappings) =>
          mappings.filter((mapping) => mapping.id !== mappingId),
        )
      }),
    )

    setToast({
      message: 'Mapping deleted.',
      actionLabel: 'Undo',
      onAction: () => {
        setZones((current) =>
          current.map((entry) => {
            if (entry.id !== zoneId) {
              return entry
            }

            const nextMappings = [...entry.mappings]
            nextMappings.splice(index, 0, removed)

            return {
              ...entry,
              mappings: nextMappings,
              type: deriveZoneTypeFromMappings(nextMappings),
            }
          }),
        )
      },
    })
  }, [zones])

  const duplicateZone = useCallback((id: string) => {
    const sourceIndex = zones.findIndex((zone) => zone.id === id)
    if (sourceIndex === -1) {
      return
    }

    const source = zones[sourceIndex]
    const newId = `zone-${Date.now()}`
    const duplicate = duplicateZoneRecord(source, newId)

    setZones((prev) => {
      const next = [...prev]
      next.splice(sourceIndex + 1, 0, {
        ...duplicate,
        mappings: cloneMappings(source.mappings),
      })
      return next
    })
    setSelectedZoneId(newId)
  }, [zones])

  const deleteZone = useCallback((id: string) => {
    const index = zones.findIndex((zone) => zone.id === id)
    if (index === -1) {
      return
    }

    const zone = zones[index]

    setZones((prev) => prev.filter((entry) => entry.id !== id))

    if (selectedZoneId === id) {
      setSelectedZoneId(null)
    }

    setToast({
      message: `Deleted ${zone.name}.`,
      actionLabel: 'Undo',
      onAction: () => {
        setZones((current) => {
          const next = [...current]
          next.splice(index, 0, zone)
          return next
        })
      },
    })
  }, [zones, selectedZoneId])

  const openZoneContextMenu = useCallback((zoneId: string, x: number, y: number) => {
    setZoneContextMenu({ zoneId, x, y })
  }, [])

  const closeZoneContextMenu = useCallback(() => {
    setZoneContextMenu(null)
  }, [])

  const applySplit = useCallback((zoneId: string, mappingId: string) => {
    setZones((prev) => {
      const zone = prev.find((z) => z.id === zoneId)
      if (!zone) return prev

      const mapping = zone.mappings.find((m) => m.id === mappingId)
      if (!mapping || mapping.type !== 'Note') return prev

      const split = mapping.split
      if (!split?.enabled) return prev

      const xDiv = split.xDivisions ?? 2
      const yDiv = split.yDivisions ?? 2
      const [, xMin, yMin, xMax, yMax] = zone.position as GesturePosition

      const xStep = (xMax - xMin) / xDiv
      const yStep = (yMax - yMin) / yDiv

      const noteCount = xDiv * yDiv
      const pool = buildScaleNotes(
        'Chromatic',
        mapping.rootNote ?? 'C',
        mapping.octave ?? 4,
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

      return prev.flatMap((z) => (z.id === zoneId ? newZones : [z]))
    })
  }, [])

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
        dismissToast,
        presetScale,
        setPresetScale,
        presetRoot,
        setPresetRoot,
        applySplit,
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
