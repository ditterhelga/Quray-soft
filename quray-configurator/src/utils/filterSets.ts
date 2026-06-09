import { FILTER_OPTIONS, type LibraryFilters } from '@/components/library/filterOptions'
import { aggregateSetSyncStatus } from '@/utils/setMembers'
import { setSyncStatusToChipStatus } from '@/utils/setActions'
import type { OutputType, Preset, Set as LibrarySet } from '@/types'

const OUTPUT_FILTER_TO_TYPE: Record<string, OutputType> = {
  note: 'MIDI Note',
  cc: 'MIDI CC',
  cv: 'CV',
}

function resolveDeviceLabel(deviceFilterId: string) {
  return FILTER_OPTIONS.device.find((option) => option.id === deviceFilterId)?.label
}

function getMemberPresets(set: LibrarySet, presetsById: Map<string, Preset>): Preset[] {
  return set.members
    .map((member) => presetsById.get(member.presetId))
    .filter((preset): preset is Preset => preset !== undefined)
}

function matchesSetSearch(set: LibrarySet, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return set.name.toLowerCase().includes(normalized)
}

function matchesSetStatus(set: LibrarySet, selected: string[]) {
  if (selected.length === 0) {
    return true
  }

  const aggregate = aggregateSetSyncStatus(set.members)
  const chipStatus = setSyncStatusToChipStatus(aggregate)

  return selected.includes(chipStatus)
}

function matchesSetOutput(
  set: LibrarySet,
  selected: string[],
  presetsById: Map<string, Preset>,
) {
  if (selected.length === 0) {
    return true
  }

  const selectedTypes = selected
    .map((id) => OUTPUT_FILTER_TO_TYPE[id])
    .filter((type): type is OutputType => type !== undefined)

  return getMemberPresets(set, presetsById).some((preset) =>
    preset.outputTypes.some((type) => selectedTypes.includes(type)),
  )
}

function matchesSetDevice(
  set: LibrarySet,
  selected: string[],
  presetsById: Map<string, Preset>,
) {
  if (selected.length === 0) {
    return true
  }

  const selectedLabels = selected
    .map(resolveDeviceLabel)
    .filter((label): label is string => label !== undefined)

  return getMemberPresets(set, presetsById).some((preset) =>
    preset.devices.some((device) => selectedLabels.includes(device)),
  )
}

export type FilterSetsOptions = {
  filters: LibraryFilters
  searchQuery: string
  presets: Preset[]
  onlyFavourites?: boolean
  favourites?: Record<string, boolean>
}

export function filterSets(
  sets: LibrarySet[],
  {
    filters,
    searchQuery,
    presets,
    onlyFavourites = false,
    favourites = {},
  }: FilterSetsOptions,
): LibrarySet[] {
  const presetsById = new Map(presets.map((preset) => [preset.id, preset]))

  return sets.filter((set) => {
    const isFavourite = favourites[set.id] ?? false

    if (onlyFavourites && !isFavourite) {
      return false
    }

    if (!matchesSetSearch(set, searchQuery)) {
      return false
    }

    if (!matchesSetStatus(set, filters.status)) {
      return false
    }

    if (!matchesSetOutput(set, filters.output, presetsById)) {
      return false
    }

    if (!matchesSetDevice(set, filters.device, presetsById)) {
      return false
    }

    return true
  })
}

export function duplicateSetNameToastMessage(name: string) {
  return `A set with this name already exists — renamed to ${name}.`
}
