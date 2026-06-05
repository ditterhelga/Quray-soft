import type { ReactNode } from 'react'
import { ActiveFilterBar } from '@/components/library/ActiveFilterBar'
import { LibraryFiltersRow } from '@/components/library/LibraryFiltersRow'
import { LibraryToolbar, type LibraryTab } from '@/components/library/LibraryToolbar'
import {
  EXPLORE_FILTER_KEYS,
  hasActiveFilters,
  LIBRARY_FILTER_KEYS,
} from '@/components/library/filterOptions'
import { Header } from '@/components/layout/Header'
import type { FilterAnchor } from '@/components/library/FilterDropdown'
import type { FilterKey, LibraryFilters } from '@/components/library/filterOptions'

type LibraryShellProps = {
  /** Presets/Sets toggle and table column headers. */
  stickyHeader?: ReactNode
  /** Preset rows. */
  children?: ReactNode
  activeTab: LibraryTab
  onActiveTabChange: (tab: LibraryTab) => void
  filters: LibraryFilters
  onFilterChange: (key: FilterKey, selected: string[]) => void
  openFilter: FilterKey | null
  openFilterAnchor: FilterAnchor | null
  onOpenFilterChange: (key: FilterKey | null, anchor: FilterAnchor | null) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onlyFavourites: boolean
  onOnlyFavouritesChange: (value: boolean) => void
  onClearAllFilters: () => void
  onNewPreset?: () => void
}

/**
 * Top-level layout for the Library page.
 *
 *  div.bg-bg-base
 *    ├─ div.hero-glow.pb-8
 *    │    ├─ Header
 *    │    ├─ LibraryToolbar
 *    │    ├─ LibraryFiltersRow        (mt-12 on the row itself)
 *    │    └─ div.mt-5 > ActiveFilterBar  (only when filters active)
 *    │
 *    ├─ div.mt-8 > stickyHeader       (toggle + column headers)
 *    └─ children                      (preset rows)
 *
 * Spacing from gradient bottom to toggle:
 *   pb-8 (32px) + mt-8 (32px) = 64px — with or without filter pills.
 */
export function LibraryShell({
  stickyHeader,
  children,
  activeTab,
  onActiveTabChange,
  filters,
  onFilterChange,
  openFilter,
  openFilterAnchor,
  onOpenFilterChange,
  searchQuery,
  onSearchQueryChange,
  onlyFavourites,
  onOnlyFavouritesChange,
  onClearAllFilters,
  onNewPreset,
}: LibraryShellProps) {
  const filterKeys = activeTab === 'explore' ? EXPLORE_FILTER_KEYS : LIBRARY_FILTER_KEYS
  const hasFilterPills = hasActiveFilters(filters, onlyFavourites, filterKeys)

  return (
    <div className="bg-bg-base">

      {/* ── GRADIENT ZONE ─────────────────────────────────────────────────────
          Header, tabs, search/filters, and active pills when present.
          pb-8 = 32px below the last element (filter row or pills).
          mt-5 on pills = 20px gap below the filter row.
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="hero-glow pb-8">
        <Header />
        <LibraryToolbar activeTab={activeTab} onActiveTabChange={onActiveTabChange} onNewPreset={onNewPreset} />
        <LibraryFiltersRow
          activeTab={activeTab}
          filters={filters}
          onFilterChange={onFilterChange}
          openFilter={openFilter}
          openFilterAnchor={openFilterAnchor}
          onOpenFilterChange={onOpenFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          onlyFavourites={onlyFavourites}
          onOnlyFavouritesChange={onOnlyFavouritesChange}
        />
        {hasFilterPills && (
          <div className="mt-5">
            <ActiveFilterBar
              activeTab={activeTab}
              filters={filters}
              onlyFavourites={onlyFavourites}
              openFilter={openFilter}
              openFilterAnchor={openFilterAnchor}
              onOpenFilterChange={onOpenFilterChange}
              onFilterChange={onFilterChange}
              onOnlyFavouritesChange={onOnlyFavouritesChange}
              onClearAll={onClearAllFilters}
            />
          </div>
        )}
      </div>
      {/* ── END GRADIENT ZONE ─────────────────────────────────────────────── */}

      <div className="mt-8">
        {stickyHeader}
      </div>

      {children}

    </div>
  )
}

export { libraryListBodyClassName } from '@/components/library/libraryLayout'
