import type { Set as LibrarySet } from '@/types'

export function filterSets(sets: LibrarySet[], searchQuery: string): LibrarySet[] {
  const normalized = searchQuery.trim().toLowerCase()

  if (!normalized) {
    return sets
  }

  return sets.filter((set) => set.name.toLowerCase().includes(normalized))
}

export function duplicateSetNameToastMessage(name: string) {
  return `A set with this name already exists — renamed to ${name}.`
}
