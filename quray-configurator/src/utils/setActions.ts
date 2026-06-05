import { duplicatePresetName, resolvePresetName } from '@/utils/presetNames'
import type { Set as LibrarySet, SetSyncStatus } from '@/types'

export function createSetId() {
  return `s-${crypto.randomUUID()}`
}

export function createEmptySet(existingNames: Set<string>): LibrarySet {
  const { name } = resolvePresetName('New set', existingNames)

  return {
    id: createSetId(),
    name,
    members: [],
    lastUpdated: new Date(),
  }
}

export function duplicateSet(source: LibrarySet, existingNames: Set<string>): LibrarySet {
  return {
    ...source,
    id: createSetId(),
    name: duplicatePresetName(source.name, existingNames),
    members: source.members.map((member) => ({ ...member })),
    lastUpdated: new Date(),
  }
}

export function setSyncStatusToChipStatus(
  status: SetSyncStatus,
): 'on-quray' | 'modified' | 'not-synced' {
  if (status === 'synced') {
    return 'on-quray'
  }

  return status
}
