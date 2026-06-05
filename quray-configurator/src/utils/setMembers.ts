import type { Set as LibrarySet, SetMember, SetSyncStatus } from '@/types'

export function getSetPresetIds(set: LibrarySet): string[] {
  return set.members.map((member) => member.presetId)
}

export function setHasPreset(set: LibrarySet, presetId: string): boolean {
  return set.members.some((member) => member.presetId === presetId)
}

export function getSetMember(
  set: LibrarySet,
  presetId: string,
): SetMember | undefined {
  return set.members.find((member) => member.presetId === presetId)
}

export function aggregateSetSyncStatus(members: SetMember[]): SetSyncStatus {
  if (members.length === 0) {
    return 'not-synced'
  }

  if (members.some((member) => member.syncStatus === 'not-synced')) {
    return 'not-synced'
  }

  if (members.some((member) => member.syncStatus === 'modified')) {
    return 'modified'
  }

  return 'synced'
}

export function createSetMember(
  presetId: string,
  syncStatus: SetSyncStatus = 'not-synced',
): SetMember {
  return { presetId, syncStatus }
}

export function reorderSetMembers(
  members: SetMember[],
  presetIds: string[],
): SetMember[] {
  const memberByPresetId = new Map(members.map((member) => [member.presetId, member]))

  return presetIds
    .map((presetId) => memberByPresetId.get(presetId))
    .filter((member): member is SetMember => member !== undefined)
}

export function appendSetMembers(
  members: SetMember[],
  presetIds: string[],
): SetMember[] {
  const existing = new Set(members.map((member) => member.presetId))
  const next = [...members]

  for (const presetId of presetIds) {
    if (!existing.has(presetId)) {
      next.push(createSetMember(presetId))
      existing.add(presetId)
    }
  }

  return next
}

export function removeSetMember(
  members: SetMember[],
  presetId: string,
): SetMember[] {
  return members.filter((member) => member.presetId !== presetId)
}

export function presetReferencedInSets(sets: LibrarySet[], presetId: string): number {
  return sets.filter((set) => setHasPreset(set, presetId)).length
}
