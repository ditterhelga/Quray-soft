import { useCallback, useMemo, useState } from 'react'
import {
  PresetListStickyHeader,
  PresetListBody,
} from '@/components/library/PresetList'
import type { ListView } from '@/components/library/PresetList'
import { LibraryShell } from '@/components/library/LibraryShell'
import type { LibraryTab } from '@/components/library/LibraryToolbar'
import type { FilterAnchor } from '@/components/library/FilterDropdown'
import {
  EMPTY_FILTERS,
  type FilterKey,
  type LibraryFilters,
} from '@/components/library/filterOptions'
import { Toast } from '@/components/ui/Toast'
import { EXPLORE_PRESETS } from '@/data/explorePresets'
import { PRESETS } from '@/data/presets'
import { SETS } from '@/data/sets'
import { filterSets, duplicateSetNameToastMessage } from '@/utils/filterSets'
import { duplicatePreset } from '@/utils/presetActions'
import { filterPresets } from '@/utils/filterPresets'
import {
  duplicateNameToastMessage,
  resolvePresetName,
} from '@/utils/presetNames'
import { duplicateSet } from '@/utils/setActions'
import {
  DEFAULT_PRESET_SORT,
  nextPresetSort,
  sortPresets,
  type SortDirection,
  type SortKey,
} from '@/utils/sortPresets'

export function Library() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('library')
  const [presets, setPresets] = useState(() => [...PRESETS])
  const [sets, setSets] = useState(() => [...SETS])
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_FILTERS)
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [openFilterAnchor, setOpenFilterAnchor] = useState<FilterAnchor | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyFavourites, setOnlyFavourites] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_PRESET_SORT.sortKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_PRESET_SORT.sortDirection,
  )
  const [favourites, setFavourites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      [...PRESETS, ...EXPLORE_PRESETS].map((preset) => [preset.id, preset.isFavourite]),
    ),
  )
  const [renamingPresetId, setRenamingPresetId] = useState<string | null>(null)
  const [renamingSetId, setRenamingSetId] = useState<string | null>(null)
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [view, setView] = useState<ListView>('presets')

  const dismissToast = useCallback(() => {
    setToastMessage(null)
  }, [])

  const isExploreTab = activeTab === 'explore'
  const isSetsView = view === 'sets'
  const presetSource = isExploreTab ? EXPLORE_PRESETS : presets
  const searchMode = isExploreTab ? 'explore' : 'library'
  const rowVariant = isExploreTab ? 'explore' : 'library'

  const visiblePresets = useMemo(() => {
    const filtered = filterPresets(presetSource, {
      filters,
      searchQuery,
      onlyFavourites,
      favourites,
      searchMode,
    })

    return sortPresets(filtered, { sortKey, sortDirection })
  }, [
    presetSource,
    filters,
    searchQuery,
    onlyFavourites,
    favourites,
    searchMode,
    sortKey,
    sortDirection,
  ])

  const visibleSets = useMemo(
    () => filterSets(sets, searchQuery),
    [sets, searchQuery],
  )

  function handleActiveTabChange(nextTab: LibraryTab) {
    if (nextTab === activeTab) {
      return
    }

    setActiveTab(nextTab)
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
    setOnlyFavourites(false)
    setOpenFilter(null)
    setOpenFilterAnchor(null)
    setSelectedIds(new Set())
    setExpandedSetId(null)
  }

  function handleViewChange(nextView: ListView) {
    if (nextView === view) {
      return
    }

    if (nextView === 'sets') {
      setSearchQuery('')
      setExpandedSetId(null)
    }

    setView(nextView)
  }

  function handleFilterChange(key: FilterKey, selected: string[]) {
    setFilters((current) => ({ ...current, [key]: selected }))
  }

  function handleOpenFilterChange(
    key: FilterKey | null,
    anchor: FilterAnchor | null,
  ) {
    setOpenFilter(key)
    setOpenFilterAnchor(anchor)
  }

  function handleClearAllFilters() {
    setFilters(EMPTY_FILTERS)
    setOnlyFavourites(false)
    setOpenFilter(null)
    setOpenFilterAnchor(null)
  }

  function handleSortChange(nextSortKey: SortKey) {
    const nextSort = nextPresetSort({ sortKey, sortDirection }, nextSortKey)
    setSortKey(nextSort.sortKey)
    setSortDirection(nextSort.sortDirection)
  }

  function toggleFavourite(presetId: string) {
    setFavourites((current) => ({
      ...current,
      [presetId]: !(current[presetId] ?? false),
    }))
  }

  function handleDuplicate(presetId: string) {
    setPresets((current) => {
      const source = current.find((preset) => preset.id === presetId)
      if (!source) {
        return current
      }

      const existingNames = new Set(current.map((preset) => preset.name))
      return [...current, duplicatePreset(source, existingNames)]
    })
  }

  function handleAddToLibrary(presetId: string) {
    const source = EXPLORE_PRESETS.find((preset) => preset.id === presetId)
    if (!source) {
      return
    }

    let addedToast: string | null = null

    setPresets((current) => {
      const existingNames = new Set(current.map((preset) => preset.name))
      const duplicate = duplicatePreset(source, existingNames)
      addedToast = `Added to My Library: ${duplicate.name}`
      return [...current, duplicate]
    })

    if (addedToast) {
      setToastMessage(addedToast)
    }
  }

  function handleRenameSave(presetId: string, rawName: string) {
    let duplicateToast: string | null = null

    setPresets((current) => {
      const otherNames = new Set(
        current
          .filter((preset) => preset.id !== presetId)
          .map((preset) => preset.name),
      )
      const { name, renamedDueToDuplicate } = resolvePresetName(rawName, otherNames)

      if (renamedDueToDuplicate) {
        duplicateToast = duplicateNameToastMessage(name)
      }

      return current.map((preset) =>
        preset.id === presetId ? { ...preset, name } : preset,
      )
    })
    setRenamingPresetId(null)

    if (duplicateToast) {
      setToastMessage(duplicateToast)
    }
  }

  function handleRenameCancel() {
    setRenamingPresetId(null)
  }

  function handleSetRenameSave(setId: string, rawName: string) {
    let duplicateToast: string | null = null

    setSets((current) => {
      const otherNames = new Set(
        current.filter((set) => set.id !== setId).map((set) => set.name),
      )
      const { name, renamedDueToDuplicate } = resolvePresetName(rawName, otherNames)

      if (renamedDueToDuplicate) {
        duplicateToast = duplicateSetNameToastMessage(name)
      }

      return current.map((set) => (set.id === setId ? { ...set, name } : set))
    })
    setRenamingSetId(null)

    if (duplicateToast) {
      setToastMessage(duplicateToast)
    }
  }

  function handleSetRenameCancel() {
    setRenamingSetId(null)
  }

  function handleDuplicateSet(setId: string) {
    setSets((current) => {
      const source = current.find((set) => set.id === setId)
      if (!source) {
        return current
      }

      const existingNames = new Set(current.map((set) => set.name))
      return [...current, duplicateSet(source, existingNames)]
    })
  }

  function handleDeleteSet(setId: string) {
    setSets((current) => current.filter((set) => set.id !== setId))

    if (expandedSetId === setId) {
      setExpandedSetId(null)
    }

    if (renamingSetId === setId) {
      setRenamingSetId(null)
    }
  }

  function handleToggleExpand(setId: string) {
    setExpandedSetId((current) => (current === setId ? null : setId))
  }

  function handlePresetAction(actionId: string, presetId: string) {
    if (actionId === 'add-to-library') {
      handleAddToLibrary(presetId)
      return
    }

    if (actionId === 'duplicate') {
      handleDuplicate(presetId)
      return
    }

    if (actionId === 'rename') {
      setRenamingPresetId(presetId)
    }
  }

  function handleSetAction(actionId: string, setId: string) {
    if (actionId === 'open-editor') {
      setToastMessage('Set editor coming soon')
      return
    }

    if (actionId === 'duplicate') {
      handleDuplicateSet(setId)
      return
    }

    if (actionId === 'rename') {
      setRenamingSetId(setId)
      return
    }

    if (actionId === 'delete') {
      handleDeleteSet(setId)
    }
  }

  function toggleSelect(presetId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(presetId)) {
        next.delete(presetId)
      } else {
        next.add(presetId)
      }

      return next
    })
  }

  function handleSelectAll() {
    setSelectedIds(new Set(visiblePresets.map((preset) => preset.id)))
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  function handleBulkSendToQuray() {
    console.log('Send to Quray', [...selectedIds])
  }

  function handleBulkExport() {
    console.log('Export presets', [...selectedIds])
  }

  const listProps = {
    presets: visiblePresets,
    variant: rowVariant as 'library' | 'explore',
    favourites,
    onToggleFavourite: toggleFavourite,
    renamingPresetId,
    onPresetAction: handlePresetAction,
    onRenameSave: handleRenameSave,
    onRenameCancel: handleRenameCancel,
    onRowClick: isExploreTab ? handleAddToLibrary : undefined,
    sortKey,
    onSortChange: handleSortChange,
    bulkSelectionEnabled: !isExploreTab && !isSetsView,
    selectedIds,
    onToggleSelect: toggleSelect,
    onSelectAll: handleSelectAll,
    onClearSelection: handleClearSelection,
    onBulkSendToQuray: handleBulkSendToQuray,
    onBulkExport: handleBulkExport,
    sets: visibleSets,
    allPresets: presets,
    expandedSetId,
    onToggleExpand: handleToggleExpand,
    renamingSetId,
    onSetAction: handleSetAction,
    onSetRenameSave: handleSetRenameSave,
    onSetRenameCancel: handleSetRenameCancel,
  }

  return (
    <>
      <LibraryShell
        activeTab={activeTab}
        onActiveTabChange={handleActiveTabChange}
        view={view}
        filters={filters}
        onFilterChange={handleFilterChange}
        openFilter={openFilter}
        openFilterAnchor={openFilterAnchor}
        onOpenFilterChange={handleOpenFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onlyFavourites={onlyFavourites}
        onOnlyFavouritesChange={setOnlyFavourites}
        onClearAllFilters={handleClearAllFilters}
        stickyHeader={
          <PresetListStickyHeader
            {...listProps}
            view={view}
            onViewChange={handleViewChange}
          />
        }
      >
        <PresetListBody {...listProps} view={view} />
      </LibraryShell>

      {toastMessage && <Toast message={toastMessage} onDismiss={dismissToast} />}
    </>
  )
}
