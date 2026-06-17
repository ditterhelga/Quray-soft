import { Toast } from '@/components/ui/Toast'
import { ZoneContextMenu, useZoneContextMenuId } from '@/components/editor/ZoneContextMenu'
import { useEditorZones } from '@/context/EditorZonesContext'

export function EditorZoneOverlays() {
  const {
    zoneContextMenu,
    closeZoneContextMenu,
    duplicateZone,
    deleteZone,
    toast,
    dismissToast,
  } = useEditorZones()
  const menuId = useZoneContextMenuId()

  return (
    <>
      <ZoneContextMenu
        open={zoneContextMenu !== null}
        x={zoneContextMenu?.x ?? 0}
        y={zoneContextMenu?.y ?? 0}
        menuId={menuId}
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
        onClose={closeZoneContextMenu}
      />

      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onDismiss={dismissToast}
        />
      )}
    </>
  )
}
