import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PresetListStickyHeader,
  PresetListBody,
} from '@/components/library/PresetList'
import { PresetDetailPanel } from '@/components/library/PresetDetailPanel'
import type { ListView } from '@/components/library/PresetList'
import { LibraryShell } from '@/components/library/LibraryShell'
import type { LibraryTab } from '@/components/library/LibraryToolbar'
import type { FilterAnchor } from '@/components/library/FilterDropdown'
import {
  EMPTY_FILTERS,
  type FilterKey,
  type FilterOption,
  type LibraryFilters,
} from '@/components/library/filterOptions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Toast } from '@/components/ui/Toast'
import { AddPresetPickerModal } from '@/components/library/AddPresetPickerModal'
import { SetPickerModal } from '@/components/library/SetPickerModal'
import { EXPLORE_PRESETS } from '@/data/explorePresets'
import { filterSets, duplicateSetNameToastMessage } from '@/utils/filterSets'
import { duplicatePreset, createBlankPreset } from '@/utils/presetActions'
import { filterPresets } from '@/utils/filterPresets'
import {
  duplicateNameToastMessage,
  resolvePresetName,
} from '@/utils/presetNames'
import { duplicateSet, createEmptySet } from '@/utils/setActions'
import {
  appendSetMembers,
  createSetMember,
  getSetMember,
  getSetPresetIds,
  getSetsContainingPreset,
  presetReferencedInSets,
  removeSetMember,
  reorderSetMembers,
  setHasPreset,
} from '@/utils/setMembers'
import {
  DEFAULT_PRESET_SORT,
  nextPresetSort,
  sortPresets,
  sortSets,
  type SortDirection,
  type SortKey,
} from '@/utils/sortPresets'
import { consumeLibrarySetFocus } from '@/utils/deviceNavigation'
import { useDeviceContext } from '@/context/DeviceContext'
import { usePresetsContext } from '@/context/PresetsContext'
import { useSidebar } from '@/context/SidebarContext'

type ToastState = {
  message: string
  key?: number
  actionLabel?: string
  onAction?: () => void
}

type SetPickerState =
  | { mode: 'add-to-set'; presetId: string }
  | { mode: 'move-to-set'; presetId: string; sourceSetId: string }
  | null

type LibraryProps = {
  mode?: 'fresh' | 'full'
}

export function Library({ mode = 'full' }: LibraryProps) {
  const { sendPresetToDevice, sendSetToDevice } = useDeviceContext()
  const {
    freshPresets, setFreshPresets,
    fullPresets, setFullPresets,
    freshSets, setFreshSets,
    fullSets, setFullSets,
    favourites, setFavourites,
  } = usePresetsContext()
  const presets = mode === 'fresh' ? freshPresets : fullPresets
  const deviceFilterOptions = useMemo<FilterOption[]>(() => {
    const seen = new Set<string>()
    const options: FilterOption[] = []
    for (const preset of presets) {
      for (const device of preset.devices ?? []) {
        const id = device.toLowerCase().replace(/\s+/g, '-')
        if (!seen.has(id)) {
          seen.add(id)
          options.push({ id, label: device })
        }
      }
    }
    return options
  }, [presets])
  const setPresets = mode === 'fresh' ? setFreshPresets : setFullPresets
  const sets = mode === 'fresh' ? freshSets : fullSets
  const setSets = mode === 'fresh' ? setFreshSets : setFullSets
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<LibraryTab>('library')
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
  const [renamingPresetId, setRenamingPresetId] = useState<string | null>(null)
  const [renamingSetId, setRenamingSetId] = useState<string | null>(null)
  const [expandedSetIds, setExpandedSetIds] = useState<Set<string>>(() => new Set())
  const [toast, setToast] = useState<ToastState | null>(null)
  const [deleteConfirmPresetId, setDeleteConfirmPresetId] = useState<string | null>(null)
  const [setPicker, setSetPicker] = useState<SetPickerState>(null)
  const [addPresetPickerSetId, setAddPresetPickerSetId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [view, setView] = useState<ListView>('presets')
  const pendingSetFocus = useRef(consumeLibrarySetFocus())
  const wasAutoCollapsed = useRef(false)
  const { isCollapsed, onCollapsedChange } = useSidebar()

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  useEffect(() => {
    if (selectedPresetId && window.innerWidth < 1280) {
      if (!isCollapsed) {
        onCollapsedChange(true)
        wasAutoCollapsed.current = true
      }
    }

    if (!selectedPresetId && wasAutoCollapsed.current) {
      onCollapsedChange(false)
      wasAutoCollapsed.current = false
    }
  }, [selectedPresetId, isCollapsed, onCollapsedChange])

  useEffect(() => {
    function handleResize() {
      if (selectedPresetId && window.innerWidth < 1280 && !isCollapsed) {
        onCollapsedChange(true)
        wasAutoCollapsed.current = true
      }

      if (window.innerWidth >= 1280 && wasAutoCollapsed.current) {
        onCollapsedChange(false)
        wasAutoCollapsed.current = false
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedPresetId, isCollapsed, onCollapsedChange])

  useEffect(() => {
    if (!selectedPresetId) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedPresetId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedPresetId])

  useEffect(() => {
    const setId = pendingSetFocus.current
    if (!setId) {
      return
    }

    setActiveTab('library')
    setView('sets')
    setExpandedSetIds(new Set([setId]))
    setSelectedIds(new Set())

    const frame = requestAnimationFrame(() => {
      document.getElementById(`library-set-${setId}`)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  const isExploreTab = activeTab === 'explore'
  const isSetsView = view === 'sets' && !isExploreTab
  const presetSource = isExploreTab ? EXPLORE_PRESETS : presets
  const searchMode = isExploreTab ? 'explore' : 'library'
  const rowVariant = isExploreTab ? 'explore' : 'library'

  const visiblePresets = useMemo(() => {
    const filtered = filterPresets(presetSource, {
      filters,
      searchQuery: isSetsView ? '' : searchQuery,
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
    isSetsView,
  ])

  const visibleSets = useMemo(() => {
    const filtered = filterSets(sets, {
      filters,
      searchQuery,
      presets,
      onlyFavourites,
      favourites,
    })

    return sortSets(filtered, { sortKey, sortDirection })
  }, [
    sets,
    filters,
    searchQuery,
    presets,
    onlyFavourites,
    favourites,
    sortKey,
    sortDirection,
  ])

  function handleActiveTabChange(nextTab: LibraryTab) {
    if (nextTab === activeTab) {
      return
    }

    setActiveTab(nextTab)
    if (nextTab === 'explore') {
      setView('presets')
    }
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
    setOnlyFavourites(false)
    setOpenFilter(null)
    setOpenFilterAnchor(null)
    setSelectedIds(new Set())
    setExpandedSetIds(new Set())
    setSelectedPresetId(null)
  }

  function handleViewChange(nextView: ListView) {
    if (nextView === view) {
      return
    }

    setSelectedIds(new Set())
    setSelectedPresetId(null)
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

  function toggleFavourite(id: string) {
    setFavourites((current) => ({
      ...current,
      [id]: !(current[id] ?? false),
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

  function handleDelete(presetId: string) {
    setPresets((current) => current.filter((preset) => preset.id !== presetId))

    setSets((current) =>
      current.map((set) => ({
        ...set,
        members: removeSetMember(set.members, presetId),
      })),
    )

    setSelectedIds((current) => {
      if (!current.has(presetId)) {
        return current
      }

      const next = new Set(current)
      next.delete(presetId)
      return next
    })

    if (renamingPresetId === presetId) {
      setRenamingPresetId(null)
    }

    if (selectedPresetId === presetId) {
      setSelectedPresetId(null)
    }

    setDeleteConfirmPresetId(null)
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
      setToast({ message: addedToast })
    }
  }

  function handlePresetRowClick(presetId: string) {
    setSelectedPresetId((current) => (current === presetId ? null : presetId))
  }

  function handleOpenInEditor(presetId: string) {
    const preset = presets.find((entry) => entry.id === presetId)
    navigate(`/editor/${presetId}`, { state: { presetName: preset?.name } })
  }

  function handleSendPresetToQuray(presetId: string) {
    const preset = presets.find((entry) => entry.id === presetId)
    setToast({
      message: 'Added to your Quray. →',
      actionLabel: 'View Device page',
      onAction: () => navigate('/device'),
      key: Date.now(),
    })
    sendPresetToDevice(presetId, preset ?? undefined)
    setPresets((current) =>
      current.map((p) =>
        p.id === presetId ? { ...p, syncStatus: 'on-quray' as const } : p,
      ),
    )
  }

  function handleNavigateToSet(setId: string) {
    setView('sets')
    setExpandedSetIds(new Set([setId]))
    setSelectedIds(new Set())
    setSelectedPresetId(null)

    requestAnimationFrame(() => {
      document.getElementById(`library-set-${setId}`)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    })
  }

  function handlePanelPresetAction(actionId: string, presetId: string) {
    if (actionId === 'duplicate') {
      handleDuplicate(presetId)
      return
    }

    if (actionId === 'add-to-set') {
      setSetPicker({ mode: 'add-to-set', presetId })
      return
    }

    if (actionId === 'rename') {
      setRenamingPresetId(presetId)
      return
    }

    if (actionId === 'export') {
      setToast({ message: 'Export coming soon.' })
      return
    }

    if (actionId === 'delete') {
      setDeleteConfirmPresetId(presetId)
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
      setToast({ message: duplicateToast })
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
      setToast({ message: duplicateToast })
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

    setExpandedSetIds((current) => {
      if (!current.has(setId)) {
        return current
      }

      const next = new Set(current)
      next.delete(setId)
      return next
    })

    setSelectedIds((current) => {
      if (!current.has(setId)) {
        return current
      }

      const next = new Set(current)
      next.delete(setId)
      return next
    })

    if (renamingSetId === setId) {
      setRenamingSetId(null)
    }
  }

  function handleToggleExpand(setId: string) {
    setExpandedSetIds((current) => {
      const next = new Set(current)

      if (next.has(setId)) {
        next.delete(setId)
      } else {
        next.add(setId)
      }

      return next
    })
  }

  function handleReorderPresets(setId: string, presetIds: string[]) {
    setSets((current) =>
      current.map((set) =>
        set.id === setId
          ? {
              ...set,
              members: reorderSetMembers(set.members, presetIds),
              lastUpdated: new Date(),
            }
          : set,
      ),
    )
  }

  function handleRemoveFromSet(setId: string, presetId: string) {
    const set = sets.find((entry) => entry.id === setId)
    const preset = presets.find((entry) => entry.id === presetId)

    if (!set || !preset) {
      return
    }

    const removedMember = getSetMember(set, presetId)

    if (!removedMember) {
      return
    }

    const removedIndex = set.members.indexOf(removedMember)

    setSets((current) =>
      current.map((entry) =>
        entry.id === setId
          ? {
              ...entry,
              members: removeSetMember(entry.members, presetId),
              lastUpdated: new Date(),
            }
          : entry,
      ),
    )

    setToast({
      message: `Removed ${preset.name} from ${set.name}`,
      actionLabel: 'Undo',
      onAction: () => {
        setSets((current) =>
          current.map((entry) => {
            if (entry.id !== setId || setHasPreset(entry, presetId)) {
              return entry
            }

            const nextMembers = [...entry.members]
            nextMembers.splice(removedIndex, 0, removedMember)
            return { ...entry, members: nextMembers, lastUpdated: new Date() }
          }),
        )
      },
    })
  }

  function handleSetPresetAction(actionId: string, setId: string, presetId: string) {
    if (actionId === 'remove-from-set') {
      handleRemoveFromSet(setId, presetId)
      return
    }

    if (actionId === 'move-to-set') {
      setSetPicker({ mode: 'move-to-set', presetId, sourceSetId: setId })
      return
    }

    if (actionId === 'open') {
      handleOpenInEditor(presetId)
    }
  }

  function handleSetPickerSelect(targetSetId: string) {
    if (!setPicker) {
      return
    }

    const preset = presets.find((entry) => entry.id === setPicker.presetId)
    const targetSet = sets.find((entry) => entry.id === targetSetId)

    if (!preset || !targetSet) {
      return
    }

    if (setPicker.mode === 'add-to-set') {
      if (setHasPreset(targetSet, setPicker.presetId)) {
        setToast({
          message: `${preset.name} is already in ${targetSet.name}`,
        })
        return
      }

      setSets((current) =>
        current.map((entry) =>
          entry.id === targetSetId
            ? {
                ...entry,
                members: appendSetMembers(entry.members, [setPicker.presetId]),
                lastUpdated: new Date(),
              }
            : entry,
        ),
      )
      return
    }

    const sourceSet = sets.find((entry) => entry.id === setPicker.sourceSetId)
    const movedMember = sourceSet
      ? getSetMember(sourceSet, setPicker.presetId)
      : undefined

    setSets((current) =>
      current.map((entry) => {
        if (entry.id === setPicker.sourceSetId) {
          return {
            ...entry,
            members: removeSetMember(entry.members, setPicker.presetId),
            lastUpdated: new Date(),
          }
        }

        if (entry.id === targetSetId) {
          return {
            ...entry,
            members: [
              ...entry.members,
              movedMember ?? createSetMember(setPicker.presetId),
            ],
            lastUpdated: new Date(),
          }
        }

        return entry
      }),
    )
    setToast({ message: `Moved ${preset.name} to ${targetSet.name}` })
  }

  function handleSetPickerCreateNew() {
    if (!setPicker) {
      return
    }

    const presetId = setPicker.presetId
    const preset = presets.find((entry) => entry.id === presetId)

    if (!preset) {
      return
    }

    const existingNames = new Set(sets.map((set) => set.name))
    const newSet = createEmptySet(existingNames)

    const sourceSet =
      setPicker.mode === 'move-to-set'
        ? sets.find((entry) => entry.id === setPicker.sourceSetId)
        : undefined
    const movedMember = sourceSet ? getSetMember(sourceSet, presetId) : undefined
    const newMember = movedMember ?? createSetMember(presetId)

    setSets((current) => {
      const withNewSet = [newSet, ...current]

      if (setPicker.mode === 'add-to-set') {
        return withNewSet.map((entry) =>
          entry.id === newSet.id
            ? { ...entry, members: [newMember], lastUpdated: new Date() }
            : entry,
        )
      }

      return withNewSet.map((entry) => {
        if (entry.id === newSet.id) {
          return { ...entry, members: [newMember], lastUpdated: new Date() }
        }

        if (entry.id === setPicker.sourceSetId) {
          return {
            ...entry,
            members: removeSetMember(entry.members, presetId),
            lastUpdated: new Date(),
          }
        }

        return entry
      })
    })

    if (setPicker.mode === 'move-to-set') {
      setToast({ message: `Moved ${preset.name} to ${newSet.name}` })
    }
  }

  function handleOpenAddPresetPicker(setId: string) {
    setAddPresetPickerSetId(setId)
  }

  function handleAddPresetsToSet(setId: string, presetIds: string[]) {
    if (presetIds.length === 0) {
      return
    }

    setSets((current) =>
      current.map((entry) =>
        entry.id === setId
          ? {
              ...entry,
              members: appendSetMembers(entry.members, presetIds),
              lastUpdated: new Date(),
            }
          : entry,
      ),
    )
  }

  function handleCreatePresetAndAddToSet(setId: string) {
    const existingNames = new Set(presets.map((preset) => preset.name))
    const newPreset = createBlankPreset(existingNames)

    setPresets((current) => [newPreset, ...current])
    setSets((current) =>
      current.map((entry) =>
        entry.id === setId
          ? {
              ...entry,
              members: appendSetMembers(entry.members, [newPreset.id]),
              lastUpdated: new Date(),
            }
          : entry,
      ),
    )
  }

  function handleNewSet() {
    const existingNames = new Set(sets.map((set) => set.name))
    const newSet = createEmptySet(existingNames)

    setSets((current) => [newSet, ...current])
    setExpandedSetIds((current) => new Set([...current, newSet.id]))
    setRenamingSetId(newSet.id)
  }

  function handlePresetAction(actionId: string, presetId: string) {
    if (actionId === 'add-to-library') {
      handleAddToLibrary(presetId)
      return
    }

    if (actionId === 'open') {
      handleOpenInEditor(presetId)
      return
    }

    if (actionId === 'duplicate') {
      handleDuplicate(presetId)
      return
    }

    if (actionId === 'rename') {
      setRenamingPresetId(presetId)
      return
    }

    if (actionId === 'add-to-set') {
      setSetPicker({ mode: 'add-to-set', presetId })
      return
    }

    if (actionId === 'send-to-quray') {
      handleSendPresetToQuray(presetId)
      return
    }

    if (actionId === 'export') {
      setToast({ message: 'Export coming soon.' })
      return
    }

    if (actionId === 'delete') {
      setDeleteConfirmPresetId(presetId)
    }
  }

  function handleSetAction(actionId: string, setId: string) {
    if (actionId === 'open-editor') {
      setToast({ message: 'Set editor coming soon' })
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

    if (actionId === 'add-presets') {
      handleOpenAddPresetPicker(setId)
      return
    }

    if (actionId === 'send-to-quray') {
      sendSetToDevice(setId)
      return
    }

    if (actionId === 'export') {
      setToast({ message: 'Export is coming soon.' })
      return
    }

    if (actionId === 'delete') {
      handleDeleteSet(setId)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  function handleSelectAll() {
    if (isSetsView) {
      setSelectedIds(new Set(visibleSets.map((set) => set.id)))
      return
    }

    setSelectedIds(new Set(visiblePresets.map((preset) => preset.id)))
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  function handleBulkSendToQuray() {
    if (isSetsView) {
      const ids = [...selectedIds]
      ids.forEach((setId) => sendSetToDevice(setId))
      setToast({
        message: ids.length === 1 ? 'Set sent to Quray.' : `${ids.length} sets sent to Quray.`,
      })
      return
    }

    const ids = [...selectedIds]
    ids.forEach((presetId) => {
      const preset = presets.find((entry) => entry.id === presetId)
      sendPresetToDevice(presetId, preset ?? undefined)
    })
    setPresets((current) =>
      current.map((p) =>
        ids.includes(p.id) ? { ...p, syncStatus: 'on-quray' as const } : p,
      ),
    )
    setToast({
      message: ids.length === 1
        ? `${presets.find((p) => p.id === ids[0])?.name ?? 'Preset'} sent to Quray.`
        : `${ids.length} presets sent to Quray.`,
    })
  }

  function handleBulkExport() {
    if (isSetsView) {
      setToast({ message: 'Export is coming soon.' })
      return
    }

    setToast({ message: 'Export is coming soon.' })
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
    onRowClick: handlePresetRowClick,
    sortKey,
    onSortChange: handleSortChange,
    bulkSelectionEnabled: !isExploreTab,
    selectedIds,
    onToggleSelect: toggleSelect,
    onSelectAll: handleSelectAll,
    onClearSelection: handleClearSelection,
    onBulkSendToQuray: handleBulkSendToQuray,
    onBulkExport: handleBulkExport,
    sets: visibleSets,
    allPresets: presets,
    expandedSetIds,
    onToggleExpand: handleToggleExpand,
    onReorderPresets: handleReorderPresets,
    renamingSetId,
    onSetAction: handleSetAction,
    onSetRenameSave: handleSetRenameSave,
    onSetRenameCancel: handleSetRenameCancel,
    onToggleSetFavourite: toggleFavourite,
    onSetPresetAction: handleSetPresetAction,
    onAddPresetToSet: handleOpenAddPresetPicker,
    panelOpen: view === 'presets' && selectedPresetId !== null,
  }

  const addPresetPickerSet = addPresetPickerSetId
    ? sets.find((set) => set.id === addPresetPickerSetId)
    : undefined

  const deletePreset = deleteConfirmPresetId
    ? presets.find((preset) => preset.id === deleteConfirmPresetId)
    : undefined

  const deletePresetSetCount = deleteConfirmPresetId
    ? presetReferencedInSets(sets, deleteConfirmPresetId)
    : 0

  const deleteConfirmBody =
    deletePreset && deletePresetSetCount > 0
      ? `${deletePreset.name} is used in ${deletePresetSetCount} set(s). Deleting removes it everywhere, including those sets.`
      : deletePreset
        ? `Delete ${deletePreset.name}? This can't be undone.`
        : ''

  const selectedPreset = selectedPresetId
    ? presetSource.find((preset) => preset.id === selectedPresetId)
    : undefined

  const listHeader = (
    <PresetListStickyHeader
      {...listProps}
      view={view}
      onViewChange={handleViewChange}
      onNewSet={handleNewSet}
    />
  )

  const listBody = <PresetListBody {...listProps} view={view} onNewSet={handleNewSet} />

  return (
    <>
      <div className={selectedPreset ? 'h-full min-h-0 w-full min-w-0 overflow-x-hidden' : undefined}>
        <LibraryShell
          activeTab={activeTab}
          onActiveTabChange={handleActiveTabChange}
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
          deviceFilterOptions={deviceFilterOptions}
          onNewPreset={() => navigate('/editor/preset-empty')}
          onImport={() => setToast({ message: 'Import is coming soon.' })}
          onHeaderClick={() => setSelectedPresetId(null)}
          stickyHeader={listHeader}
          detailPanel={
            selectedPreset ? (
              <PresetDetailPanel
                variant={isExploreTab ? 'explore' : 'library'}
                preset={selectedPreset}
                memberSets={
                  isExploreTab
                    ? []
                    : getSetsContainingPreset(sets, selectedPreset.id)
                }
                isFavourite={favourites[selectedPreset.id] ?? selectedPreset.isFavourite}
                onToggleFavourite={() => toggleFavourite(selectedPreset.id)}
                onClose={() => setSelectedPresetId(null)}
                onOpenInEditor={() => handleOpenInEditor(selectedPreset.id)}
                onAddToLibrary={() => handleAddToLibrary(selectedPreset.id)}
                onSendToQuray={() => handleSendPresetToQuray(selectedPreset.id)}
                onNavigateToSet={handleNavigateToSet}
                onDuplicate={() => handlePanelPresetAction('duplicate', selectedPreset.id)}
                onRename={() => handlePanelPresetAction('rename', selectedPreset.id)}
                onAddToSet={() => handlePanelPresetAction('add-to-set', selectedPreset.id)}
                onExport={() => handlePanelPresetAction('export', selectedPreset.id)}
                onDelete={() => handlePanelPresetAction('delete', selectedPreset.id)}
              />
            ) : undefined
          }
        >
          {listBody}
        </LibraryShell>
      </div>

      {toast && (
        <Toast
          key={toast.key ?? toast.message}
          message={toast.message}
          onDismiss={dismissToast}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
        />
      )}

      {deletePreset && deleteConfirmPresetId && (
        <ConfirmDialog
          open
          title="Delete preset"
          body={deleteConfirmBody}
          confirmLabel="Delete"
          destructive
          onConfirm={() => handleDelete(deleteConfirmPresetId)}
          onCancel={() => setDeleteConfirmPresetId(null)}
        />
      )}

      <SetPickerModal
        open={setPicker !== null}
        title={setPicker?.mode === 'move-to-set' ? 'Move to set' : 'Add to set'}
        sets={sets}
        excludeSetId={
          setPicker?.mode === 'move-to-set' ? setPicker.sourceSetId : undefined
        }
        onClose={() => setSetPicker(null)}
        onSelectSet={handleSetPickerSelect}
        onCreateSet={handleSetPickerCreateNew}
      />

      {addPresetPickerSet && (
        <AddPresetPickerModal
          open={addPresetPickerSetId !== null}
          presets={presets}
          setPresetIds={getSetPresetIds(addPresetPickerSet)}
          onClose={() => setAddPresetPickerSetId(null)}
          onAdd={(presetIds) => handleAddPresetsToSet(addPresetPickerSet.id, presetIds)}
          onCreatePreset={() => handleCreatePresetAndAddToSet(addPresetPickerSet.id)}
        />
      )}
    </>
  )
}
