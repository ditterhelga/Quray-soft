import type { Preset } from '@/types'

export type SortKey = 'name' | 'zones' | 'lastUpdated'
export type SortDirection = 'asc' | 'desc'

export type PresetSort = {
  sortKey: SortKey
  sortDirection: SortDirection
}

export const DEFAULT_PRESET_SORT: PresetSort = {
  sortKey: 'lastUpdated',
  sortDirection: 'desc',
}

export function getDefaultSortDirection(sortKey: SortKey): SortDirection {
  if (sortKey === 'lastUpdated') {
    return 'desc'
  }

  return 'asc'
}

export function nextPresetSort(current: PresetSort, sortKey: SortKey): PresetSort {
  if (current.sortKey !== sortKey) {
    return {
      sortKey,
      sortDirection: getDefaultSortDirection(sortKey),
    }
  }

  return {
    sortKey,
    sortDirection: current.sortDirection === 'asc' ? 'desc' : 'asc',
  }
}

export function sortPresets(presets: Preset[], sort: PresetSort): Preset[] {
  const multiplier = sort.sortDirection === 'asc' ? 1 : -1

  return [...presets].sort((a, b) => {
    let comparison = 0

    switch (sort.sortKey) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'zones':
        comparison = a.zoneCount - b.zoneCount
        break
      case 'lastUpdated':
        comparison =
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        break
    }

    return comparison * multiplier
  })
}
