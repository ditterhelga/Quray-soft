import { FILTER_OPTIONS, type LibraryFilters } from '@/components/library/filterOptions'
import type { OutputType, Preset } from '@/types'

const OUTPUT_FILTER_TO_TYPE: Record<string, OutputType> = {
  note: 'MIDI Note',
  cc: 'MIDI CC',
  cv: 'CV',
}

function resolveDeviceLabel(deviceFilterId: string) {
  return FILTER_OPTIONS.device.find((option) => option.id === deviceFilterId)?.label
}

function resolveTagLabel(tagFilterId: string) {
  return FILTER_OPTIONS.tags.find((option) => option.id === tagFilterId)?.label
}

function matchesSearch(
  preset: Preset,
  query: string,
  searchMode: 'library' | 'explore',
) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  if (preset.name.toLowerCase().includes(normalized)) {
    return true
  }

  if (searchMode === 'explore') {
    return (preset.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
  }

  return preset.targetDevices.some((device) =>
    device.toLowerCase().includes(normalized),
  )
}

function matchesStatus(preset: Preset, selected: string[]) {
  if (selected.length === 0) {
    return true
  }

  return selected.includes(preset.syncStatus)
}

function matchesOutput(preset: Preset, selected: string[]) {
  if (selected.length === 0) {
    return true
  }

  const selectedTypes = selected
    .map((id) => OUTPUT_FILTER_TO_TYPE[id])
    .filter((type): type is OutputType => type !== undefined)

  return preset.outputTypes.some((type) => selectedTypes.includes(type))
}

function matchesDevice(preset: Preset, selected: string[]) {
  if (selected.length === 0) {
    return true
  }

  const selectedLabels = selected
    .map(resolveDeviceLabel)
    .filter((label): label is string => label !== undefined)

  return preset.targetDevices.some((device) => selectedLabels.includes(device))
}

function matchesTags(preset: Preset, selected: string[]) {
  if (selected.length === 0) {
    return true
  }

  const selectedLabels = selected
    .map(resolveTagLabel)
    .filter((label): label is string => label !== undefined)

  const tags = preset.tags ?? []

  return tags.some((tag) => selectedLabels.includes(tag))
}

export type FilterPresetsOptions = {
  filters: LibraryFilters
  searchQuery: string
  onlyFavourites: boolean
  favourites: Record<string, boolean>
  searchMode?: 'library' | 'explore'
}

export function filterPresets(
  presets: Preset[],
  {
    filters,
    searchQuery,
    onlyFavourites,
    favourites,
    searchMode = 'library',
  }: FilterPresetsOptions,
): Preset[] {
  return presets.filter((preset) => {
    const isFavourite = favourites[preset.id] ?? preset.isFavourite

    if (onlyFavourites && !isFavourite) {
      return false
    }

    if (!matchesSearch(preset, searchQuery, searchMode)) {
      return false
    }

    if (searchMode === 'library' && !matchesStatus(preset, filters.status)) {
      return false
    }

    if (!matchesOutput(preset, filters.output)) {
      return false
    }

    if (searchMode === 'library' && !matchesDevice(preset, filters.device)) {
      return false
    }

    if (searchMode === 'explore' && !matchesTags(preset, filters.tags)) {
      return false
    }

    return true
  })
}
