import { duplicatePresetName, todayIsoDate } from '@/utils/presetNames'
import type { Preset } from '@/types'

export function createPresetId() {
  return `p-${crypto.randomUUID()}`
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
