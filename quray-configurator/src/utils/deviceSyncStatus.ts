import type { DeviceSlot, DeviceSyncStatus } from '@/data/deviceWorkingSet'
import { DEVICE_PRESET_SYNC } from '@/data/deviceWorkingSet'
import type { Set as LibrarySet } from '@/types'

export type DevicePresetSyncMap = Record<string, DeviceSyncStatus>

export function getDevicePresetSyncStatus(
  presetId: string,
  presetSync: DevicePresetSyncMap = DEVICE_PRESET_SYNC,
): DeviceSyncStatus {
  return presetSync[presetId] ?? 'current'
}

export function aggregateDeviceSyncStatus(
  statuses: DeviceSyncStatus[],
): DeviceSyncStatus {
  if (statuses.some((status) => status === 'needs-sync')) {
    return 'needs-sync'
  }

  return 'current'
}

export function getDeviceSetSyncStatus(
  set: LibrarySet,
  presetSync: DevicePresetSyncMap = DEVICE_PRESET_SYNC,
): DeviceSyncStatus {
  const memberStatuses = set.members.map((member) =>
    getDevicePresetSyncStatus(member.presetId, presetSync),
  )

  return aggregateDeviceSyncStatus(memberStatuses)
}

export function resolveDeviceSlotSyncStatus(
  slot: DeviceSlot,
  setsById: Map<string, LibrarySet>,
  presetSync: DevicePresetSyncMap = DEVICE_PRESET_SYNC,
): DeviceSyncStatus {
  if (slot.type === 'preset') {
    return slot.syncStatus
  }

  const set = setsById.get(slot.setId)
  if (!set) {
    return 'current'
  }

  return getDeviceSetSyncStatus(set, presetSync)
}

export function countDeviceSlotsNeedingSync(
  slots: DeviceSlot[],
  setsById: Map<string, LibrarySet>,
  presetSync: DevicePresetSyncMap = DEVICE_PRESET_SYNC,
): number {
  return slots.filter(
    (slot) => resolveDeviceSlotSyncStatus(slot, setsById, presetSync) === 'needs-sync',
  ).length
}
