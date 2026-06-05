import { duplicatePresetName } from '@/utils/presetNames'
import type { Set as LibrarySet } from '@/types'

export function createSetId() {
  return `s-${crypto.randomUUID()}`
}

export function duplicateSet(source: LibrarySet, existingNames: Set<string>): LibrarySet {
  return {
    ...source,
    id: createSetId(),
    name: duplicatePresetName(source.name, existingNames),
    presetIds: [...source.presetIds],
    syncStatus: 'not-synced',
    lastUpdated: new Date(),
  }
}

export function setSyncStatusToChipStatus(
  status: LibrarySet['syncStatus'],
): 'on-quray' | 'modified' | 'not-synced' {
  if (status === 'synced') {
    return 'on-quray'
  }

  return status
}
