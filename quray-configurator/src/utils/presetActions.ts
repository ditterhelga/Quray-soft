import { duplicatePresetName, resolvePresetName, todayIsoDate } from '@/utils/presetNames'
import type { Preset } from '@/types'

export function createPresetId() {
  return `p-${crypto.randomUUID()}`
}

export function createBlankPreset(existingNames: Set<string>): Preset {
  const { name } = resolvePresetName('New preset', existingNames)

  return {
    id: createPresetId(),
    name,
    devices: [],
    outputTypes: [],
    zoneCount: 0,
    zones: [],
    lastUpdated: todayIsoDate(),
    syncStatus: 'not-synced',
    isFavourite: false,
  }
}

export function duplicatePreset(source: Preset, existingNames: Set<string>): Preset {
  return {
    ...source,
    id: createPresetId(),
    name: duplicatePresetName(source.name, existingNames),
    syncStatus: 'not-synced',
    isFavourite: false,
    lastUpdated: todayIsoDate(),
  }
}
