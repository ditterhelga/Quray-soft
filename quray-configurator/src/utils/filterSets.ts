import type { Set as LibrarySet } from '@/types'

export type FilterSetsOptions = {
  searchQuery: string
  onlyFavourites?: boolean
  favourites?: Record<string, boolean>
}

export function filterSets(
  sets: LibrarySet[],
  { searchQuery, onlyFavourites = false, favourites = {} }: FilterSetsOptions,
): LibrarySet[] {
  const normalized = searchQuery.trim().toLowerCase()

  return sets.filter((set) => {
    const isFavourite = favourites[set.id] ?? false

    if (onlyFavourites && !isFavourite) {
      return false
    }

    if (!normalized) {
      return true
    }

    return set.name.toLowerCase().includes(normalized)
  })
}

export function duplicateSetNameToastMessage(name: string) {
  return `A set with this name already exists — renamed to ${name}.`
}
