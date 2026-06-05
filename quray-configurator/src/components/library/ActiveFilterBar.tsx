import { X } from '@phosphor-icons/react'
import { useId, useRef, type MouseEvent } from 'react'
import {
  FilterDropdownPanel,
  useFilterDropdownDismiss,
  type FilterAnchor,
} from '@/components/library/FilterDropdown'
import {
  FILTER_OPTIONS,
  FILTER_LABELS,
  EXPLORE_FILTER_KEYS,
  formatFilterPillLabel,
  hasActiveFilters,
  LIBRARY_FILTER_KEYS,
  type FilterKey,
  type LibraryFilters,
} from '@/components/library/filterOptions'
import type { LibraryTab } from '@/components/library/LibraryToolbar'

type OpenFilterChange = (key: FilterKey | null, anchor: FilterAnchor | null) => void

type ActiveFilterPillProps = {
  filterKey: FilterKey
  filters: LibraryFilters
  openFilter: FilterKey | null
  openFilterAnchor: FilterAnchor | null
  onOpenFilterChange: OpenFilterChange
  onFilterChange: (key: FilterKey, selected: string[]) => void
}

function FilterPillClearButton({
  onClick,
  ariaLabel,
}: {
  onClick: (event: MouseEvent) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={activeFilterPillClearClassName()}
      aria-label={ariaLabel}
    >
      <X size={14} weight="regular" aria-hidden="true" />
    </button>
  )
}

function ActiveFilterPill({
  filterKey,
  filters,
  openFilter,
  openFilterAnchor,
  onOpenFilterChange,
  onFilterChange,
}: ActiveFilterPillProps) {
  const label = FILTER_LABELS[filterKey]
  const pillText = formatFilterPillLabel(filterKey, filters[filterKey])
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isOpen = openFilter === filterKey && openFilterAnchor === 'pill'

  useFilterDropdownDismiss(
    isOpen,
    () => onOpenFilterChange(null, null),
    containerRef,
  )

  function handleBodyClick() {
    if (isOpen) {
      onOpenFilterChange(null, null)
      return
    }

    onOpenFilterChange(filterKey, 'pill')
  }

  function handleClear(event: MouseEvent) {
    event.stopPropagation()
    onFilterChange(filterKey, [])
    if (isOpen) {
      onOpenFilterChange(null, null)
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div className="flex h-8 items-center rounded-lg border border-border bg-bg-active pl-3 pr-1 text-sm font-light text-text-primary">
        <button
          type="button"
          onClick={handleBodyClick}
          className={`${activeFilterPillBodyClassName(isOpen)} cursor-pointer`}
        >
          {pillText}
        </button>
        <FilterPillClearButton
          onClick={handleClear}
          ariaLabel={`Clear ${label} filter`}
        />
      </div>

      {isOpen && (
        <FilterDropdownPanel
          menuId={menuId}
          options={FILTER_OPTIONS[filterKey]}
          selected={filters[filterKey]}
          onSelectedChange={(selected) => onFilterChange(filterKey, selected)}
          className="absolute left-0 top-full z-50 mt-1.5"
        />
      )}
    </div>
  )
}

type FavouritesFilterPillProps = {
  onClear: () => void
}

function FavouritesFilterPill({ onClear }: FavouritesFilterPillProps) {
  return (
    <div className="flex h-8 shrink-0 items-center rounded-lg border border-border bg-bg-active pl-3 pr-1 text-sm font-light text-text-primary">
      <span className={activeFilterPillBodyClassName()}>Favourites</span>
      <FilterPillClearButton
        onClick={(event) => {
          event.stopPropagation()
          onClear()
        }}
        ariaLabel="Clear favourites filter"
      />
    </div>
  )
}

type ActiveFilterBarProps = {
  activeTab: LibraryTab
  filters: LibraryFilters
  onlyFavourites: boolean
  openFilter: FilterKey | null
  openFilterAnchor: FilterAnchor | null
  onOpenFilterChange: OpenFilterChange
  onFilterChange: (key: FilterKey, selected: string[]) => void
  onOnlyFavouritesChange: (value: boolean) => void
  onClearAll: () => void
}

export function activeFilterPillClassName() {
  return 'flex h-8 items-center rounded-lg border border-border bg-bg-active pl-3 pr-1 text-sm font-light text-text-primary'
}

export function activeFilterPillBodyClassName(fullOpacity = false) {
  return `pr-1 transition-opacity duration-[120ms] ease-in-out ${
    fullOpacity ? 'opacity-100' : 'opacity-70 hover:opacity-100'
  }`
}

export function activeFilterPillClearClassName() {
  return 'flex h-6 w-6 cursor-pointer items-center justify-center text-text-muted transition-colors duration-[120ms] hover:text-status-error'
}

export function activeFilterBarClearAllClassName() {
  return 'ml-4 cursor-pointer text-sm font-light text-text-muted transition-colors duration-[120ms] hover:text-status-error'
}

export function ActiveFilterBar({
  activeTab,
  filters,
  onlyFavourites,
  openFilter,
  openFilterAnchor,
  onOpenFilterChange,
  onFilterChange,
  onOnlyFavouritesChange,
  onClearAll,
}: ActiveFilterBarProps) {
  const filterKeys = activeTab === 'explore' ? EXPLORE_FILTER_KEYS : LIBRARY_FILTER_KEYS

  if (!hasActiveFilters(filters, onlyFavourites, filterKeys)) {
    return null
  }

  const activeGroups = filterKeys.filter((key) => filters[key].length > 0)

  return (
    <div className="flex flex-wrap items-center gap-2 px-8">
      {activeGroups.map((key) => (
        <ActiveFilterPill
          key={key}
          filterKey={key}
          filters={filters}
          openFilter={openFilter}
          openFilterAnchor={openFilterAnchor}
          onOpenFilterChange={onOpenFilterChange}
          onFilterChange={onFilterChange}
        />
      ))}

      {onlyFavourites && (
        <FavouritesFilterPill onClear={() => onOnlyFavouritesChange(false)} />
      )}

      <button
        type="button"
        onClick={onClearAll}
        className={activeFilterBarClearAllClassName()}
      >
        Clear all
      </button>
    </div>
  )
}
