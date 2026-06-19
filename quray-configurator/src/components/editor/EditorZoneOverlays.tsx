import { ZoneContextMenu, useZoneContextMenuId } from '@/components/editor/ZoneContextMenu'
import { useEditorZones } from '@/context/EditorZonesContext'

export function EditorZoneOverlays() {
  const {
    zones,
    setZones,
    zoneContextMenu,
    closeZoneContextMenu,
    duplicateZone,
    deleteZone,
  } = useEditorZones()
  const menuId = useZoneContextMenuId()

  const menuZone = zoneContextMenu
    ? zones.find((z) => z.id === zoneContextMenu.zoneId)
    : undefined

  return (
    <>
      <ZoneContextMenu
        open={zoneContextMenu !== null}
        x={zoneContextMenu?.x ?? 0}
        y={zoneContextMenu?.y ?? 0}
        menuId={menuId}
        isLocked={menuZone?.locked ?? false}
        isActive={menuZone?.active ?? true}
        onDuplicate={() => {
          if (zoneContextMenu) {
            duplicateZone(zoneContextMenu.zoneId)
          }
        }}
        onDelete={() => {
          if (zoneContextMenu) {
            deleteZone(zoneContextMenu.zoneId)
          }
        }}
        onToggleLocked={() => {
          if (zoneContextMenu) {
            setZones((prev) =>
              prev.map((z) =>
                z.id === zoneContextMenu.zoneId ? { ...z, locked: !z.locked } : z,
              ),
            )
          }
        }}
        onToggleActive={() => {
          if (zoneContextMenu) {
            setZones((prev) =>
              prev.map((z) =>
                z.id === zoneContextMenu.zoneId ? { ...z, active: !z.active } : z,
              ),
            )
          }
        }}
        onClose={closeZoneContextMenu}
      />
    </>
  )
}
