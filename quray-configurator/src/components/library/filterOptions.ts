import type { ComponentType, SVGProps } from 'react'
import StatusModifiedIcon from '@/assets/icons/status-modified.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'

export type FilterKey = 'status' | 'output' | 'device' | 'tags'

export type LibraryFilters = Record<FilterKey, string[]>

export type FilterOption = {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  iconClassName?: string
}

export const TAG_POOL = [
  'Ambient',
  'Bass',
  'Lead',
  'Percussion',
  'Drone',
  'Sequence',
  'FX',
  'Experimental',
  'Generative',
  'Modular',
] as const

export type TagName = (typeof TAG_POOL)[number]

export const FILTER_OPTIONS: Record<FilterKey, FilterOption[]> = {
  status: [
    {
      id: 'on-quray',
      label: 'On Quray',
      icon: StatusOnIcon,
      iconClassName: 'text-status-positive',
    },
    {
      id: 'modified',
      label: 'Modified',
      icon: StatusModifiedIcon,
      iconClassName: 'text-status-progress',
    },
    {
      id: 'not-synced',
      label: 'Not synced',
      icon: StatusNoneIcon,
      iconClassName: 'text-status-neutral',
    },
  ],
  output: [
    { id: 'note', label: 'Note' },
    { id: 'cc', label: 'CC' },
    { id: 'cv', label: 'CV' },
  ],
  device: [
    { id: 'moog-subsequent-37', label: 'Moog Subsequent 37' },
    { id: 'elektron-digitone', label: 'Elektron Digitone' },
    { id: 'make-noise-0-coast', label: 'Make Noise 0-Coast' },
    { id: 'arturia-microfreak', label: 'Arturia MicroFreak' },
    { id: 'mutable-instruments-plaits', label: 'Mutable Instruments Plaits' },
    { id: 'intellijel-metropolix', label: 'Intellijel Metropolix' },
  ],
  tags: TAG_POOL.map((tag) => ({
    id: tag.toLowerCase(),
    label: tag,
  })),
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  status: 'Status',
  output: 'Output',
  device: 'Device',
  tags: 'Tags',
}

export const LIBRARY_FILTER_KEYS: FilterKey[] = ['status', 'output', 'device']
export const EXPLORE_FILTER_KEYS: FilterKey[] = ['output', 'tags']

export const EMPTY_FILTERS: LibraryFilters = {
  status: [],
  output: [],
  device: [],
  tags: [],
}

export function hasActiveFilters(
  filters: LibraryFilters,
  onlyFavourites: boolean,
  filterKeys: FilterKey[] = Object.keys(FILTER_OPTIONS) as FilterKey[],
): boolean {
  if (onlyFavourites) {
    return true
  }

  return filterKeys.some((key) => filters[key].length > 0)
}

function resolveSelectedLabels(filterKey: FilterKey, selectedIds: string[]) {
  const options = FILTER_OPTIONS[filterKey]

  return selectedIds.map(
    (id) => options.find((option) => option.id === id)?.label ?? id,
  )
}

export function formatFilterPillLabel(
  filterKey: FilterKey,
  selectedIds: string[],
): string {
  const groupLabel = FILTER_LABELS[filterKey]
  const labels = resolveSelectedLabels(filterKey, selectedIds)

  if (labels.length === 0) {
    return groupLabel
  }

  if (filterKey === 'device') {
    if (labels.length === 1) {
      return `${groupLabel}: ${labels[0]}`
    }

    return `${groupLabel}: ${labels[0]} +${labels.length - 1}`
  }

  if (labels.length <= 2) {
    return `${groupLabel}: ${labels.join(', ')}`
  }

  return `${groupLabel}: ${labels[0]}, ${labels[1]} +${labels.length - 2}`
}
