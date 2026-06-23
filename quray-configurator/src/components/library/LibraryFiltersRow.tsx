import type { FilterAnchor } from '@/components/library/FilterDropdown'
import { FilterDropdown } from '@/components/library/FilterDropdown'
import type { LibraryTab } from '@/components/library/LibraryToolbar'
import {
  EXPLORE_FILTER_KEYS,
  FILTER_LABELS,
  FILTER_OPTIONS,
  LIBRARY_FILTER_KEYS,
  type FilterKey,
  type FilterOption,
  type LibraryFilters,
} from '@/components/library/filterOptions'
import { FavouritesToggleButton } from '@/components/ui/FavouritesToggleButton'
import { SearchField } from '@/components/ui/SearchField'

type LibraryFiltersRowProps = {
  activeTab: LibraryTab
  filters: LibraryFilters
  onFilterChange: (key: FilterKey, selected: string[]) => void
  openFilter: FilterKey | null
  openFilterAnchor: FilterAnchor | null
  onOpenFilterChange: (key: FilterKey | null, anchor: FilterAnchor | null) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onlyFavourites: boolean
  onOnlyFavouritesChange: (value: boolean) => void
  deviceFilterOptions?: FilterOption[]
}

export function libraryFiltersRowClassName() {
  return 'mt-12 flex min-w-0 flex-wrap items-center gap-3 px-8'
}

export function LibraryFiltersRow({
  activeTab,
  filters,
  onFilterChange,
  openFilter,
  openFilterAnchor,
  onOpenFilterChange,
  searchQuery,
  onSearchQueryChange,
  onlyFavourites,
  onOnlyFavouritesChange,
  deviceFilterOptions,
}: LibraryFiltersRowProps) {
  const filterKeys = activeTab === 'explore' ? EXPLORE_FILTER_KEYS : LIBRARY_FILTER_KEYS

  return (
    <div className={libraryFiltersRowClassName()}>
      <SearchField value={searchQuery} onValueChange={onSearchQueryChange} />
      {filterKeys.map((key) => (
        <FilterDropdown
          key={key}
          label={FILTER_LABELS[key]}
          options={key === 'device' && deviceFilterOptions !== undefined ? deviceFilterOptions : FILTER_OPTIONS[key]}
          selected={filters[key]}
          onSelectedChange={(selected) => onFilterChange(key, selected)}
          isOpen={openFilter === key && openFilterAnchor === 'button'}
          onOpenChange={(open) =>
            onOpenFilterChange(open ? key : null, open ? 'button' : null)
          }
        />
      ))}
      <FavouritesToggleButton
        active={onlyFavourites}
        onToggle={() => onOnlyFavouritesChange(!onlyFavourites)}
      />
    </div>
  )
}
