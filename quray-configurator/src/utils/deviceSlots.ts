import type { DeviceSlot } from '@/data/deviceWorkingSet'
import type { DevicePresetSyncMap } from '@/utils/deviceSyncStatus'
import { getDeviceSetSyncStatus } from '@/utils/deviceSyncStatus'
import type { Preset, Set as LibrarySet } from '@/types'

export function getDeviceSlotId(slot: DeviceSlot): string {
  return slot.type === 'set' ? `set:${slot.setId}` : `preset:${slot.presetId}`
}

export function getDeviceSlotName(
  slot: DeviceSlot,
  setsById: Map<string, LibrarySet>,
  presetsById: Map<string, Preset>,
): string {
  if (slot.type === 'set') {
    return setsById.get(slot.setId)?.name ?? 'Set'
  }

  return presetsById.get(slot.presetId)?.name ?? 'Preset'
}

export function markDeviceSlotCurrent(
  slot: DeviceSlot,
  slots: DeviceSlot[],
  presetSync: DevicePresetSyncMap,
  setsById: Map<string, LibrarySet>,
): { slots: DeviceSlot[]; presetSync: DevicePresetSyncMap } {
  if (slot.type === 'preset') {
    return {
      slots: slots.map((entry) =>
        entry.type === 'preset' && entry.presetId === slot.presetId
          ? { ...entry, syncStatus: 'current' as const }
          : entry,
      ),
      presetSync,
    }
  }

  const set = setsById.get(slot.setId)
  if (!set) {
    return { slots, presetSync }
  }

  const nextPresetSync = { ...presetSync }
  for (const member of set.members) {
    nextPresetSync[member.presetId] = 'current'
  }

  return { slots, presetSync: nextPresetSync }
}

export function markDeviceSlotsCurrent(
  slotIds: Set<string>,
  slots: DeviceSlot[],
  presetSync: DevicePresetSyncMap,
  setsById: Map<string, LibrarySet>,
): { slots: DeviceSlot[]; presetSync: DevicePresetSyncMap } {
  let nextSlots = slots
  let nextPresetSync = presetSync

  for (const slot of slots) {
    if (!slotIds.has(getDeviceSlotId(slot))) {
      continue
    }

    const next = markDeviceSlotCurrent(slot, nextSlots, nextPresetSync, setsById)
    nextSlots = next.slots
    nextPresetSync = next.presetSync
  }

  return { slots: nextSlots, presetSync: nextPresetSync }
}

export function slotNeedsSync(
  slot: DeviceSlot,
  setsById: Map<string, LibrarySet>,
  presetSync: DevicePresetSyncMap,
): boolean {
  if (slot.type === 'preset') {
    return slot.syncStatus === 'needs-sync'
  }

  const set = setsById.get(slot.setId)
  if (!set) {
    return false
  }

  return getDeviceSetSyncStatus(set, presetSync) === 'needs-sync'
}

export function selectedSlotsNeedSync(
  slotIds: Set<string>,
  slots: DeviceSlot[],
  setsById: Map<string, LibrarySet>,
  presetSync: DevicePresetSyncMap,
): boolean {
  return slots.some(
    (slot) =>
      slotIds.has(getDeviceSlotId(slot)) &&
      slotNeedsSync(slot, setsById, presetSync),
  )
}
