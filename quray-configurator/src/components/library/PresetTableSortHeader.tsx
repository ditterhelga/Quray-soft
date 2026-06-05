import SortIcon from '@/assets/icons/sort-icon.svg?react'
import type { SortKey } from '@/utils/sortPresets'

type PresetTableSortHeaderProps = {
  label: string
  sortKey: SortKey
  activeSortKey: SortKey
  onSort: (sortKey: SortKey) => void
}

export function presetTableSortHeaderClassName(active: boolean) {
  return `flex cursor-pointer items-center gap-2 text-sm font-light transition-colors duration-[120ms] ${
    active
      ? 'text-text-secondary hover:text-text-primary'
      : 'text-text-muted hover:text-text-primary'
  }`
}

export function presetTableSortIconClassName(active: boolean) {
  return `block shrink-0 ${active ? 'text-text-secondary' : 'text-text-muted'}`
}

export function PresetTableSortHeader({
  label,
  sortKey,
  activeSortKey,
  onSort,
}: PresetTableSortHeaderProps) {
  const active = activeSortKey === sortKey

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={presetTableSortHeaderClassName(active)}
      aria-pressed={active}
    >
      {label}
      <SortIcon className={presetTableSortIconClassName(active)} aria-hidden="true" />
    </button>
  )
}
