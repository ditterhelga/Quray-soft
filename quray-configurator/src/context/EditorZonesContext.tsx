import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  applyMappingTypeChange,
  cloneMappings,
  createDefaultMapping,
  deriveZoneTypeFromMappings,
  type ZoneMapping,
  type ZoneMappingType,
} from '@/components/editor/zoneMappings'
import type { EditorZone } from '@/types'
import { duplicateZoneRecord } from '@/utils/zoneActions'

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
