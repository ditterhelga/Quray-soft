import { useMemo, useState } from 'react'
import { BulkActionBar } from '@/components/library/BulkActionBar'
import { LibraryViewToggle, type ListView } from '@/components/library/LibraryViewToggle'
import {
  presetListBodyEmptyClassName,
  presetListBodyRowsClassName,
  presetListTableHeaderClassName,
  presetListToolbarClassName,
  libraryListBodyClassName,
} from '@/components/library/libraryLayout'
import { PresetTableSortHeader } from '@/components/library/PresetTableSortHeader'
import { PresetRow } from '@/components/library/PresetRow'
import { SetRow } from '@/components/library/SetRow'
import { PRESET_TABLE_HEADER, PRESET_TABLE_HEADER_EXPLORE } from '@/components/library/presetTableLayout'
import type { SortKey } from '@/utils/sortPresets'
import type { Preset, Set as LibrarySet } from '@/types'

type SetListProps = {
  sets?: LibrarySet[]
  allPresets?: Preset[]
  expandedSetId?: string | null
  onToggleExpand?: (setId: string) => void
  renamingSetId?: string | null
  onSetAction?: (actionId: string, setId: string) => void
  onSetRenameSave?: (setId: string, name: string) => void
  onSetRenameCancel?: () => void
}

type PresetListSharedProps = {
  presets: Preset[]
  variant?: 'library' | 'explore'
  favourites: Record<string, boolean>
  onToggleFavourite: (presetId: string) => void
  renamingPresetId: string | null
  onPresetAction: (actionId: string, presetId: string) => void
  onRenameSave: (presetId: string, name: string) => void
  onRenameCancel: () => void
  onRowClick?: (presetId: string) => void
  sortKey: SortKey
  onSortChange: (sortKey: SortKey) => void
  bulkSelectionEnabled?: boolean
  selectedIds: Set<string>
  onToggleSelect: (presetId: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkSendToQuray: () => void
  onBulkExport: () => void
} & SetListProps

type PresetListProps = PresetListSharedProps

type PresetListStickyHeaderProps = PresetListSharedProps & {
  view: ListView
  onViewChange: (view: ListView) => void
}

export function PresetListStickyHeader({
  presets,
  variant = 'library',
  sortKey,
  onSortChange,
  bulkSelectionEnabled = false,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onBulkSendToQuray,
  onBulkExport,
  view,
  onViewChange,
}: PresetListStickyHeaderProps) {
  const selectedCount = selectedIds.size
  const tableHeaderClassName =
    variant === 'explore' ? PRESET_TABLE_HEADER_EXPLORE : PRESET_TABLE_HEADER

  if (view !== 'presets') {
    return (
      <div className={presetListToolbarClassName()}>
        <LibraryViewToggle value={view} onChange={onViewChange} />
      </div>
    )
  }

  return (
    <>
      <div className={presetListToolbarClassName()}>
        <LibraryViewToggle value={view} onChange={onViewChange} />
        {bulkSelectionEnabled && (
          <BulkActionBar
            selectedCount={selectedCount}
            totalCount={presets.length}
            onSelectAll={onSelectAll}
            onClear={onClearSelection}
            onSendToQuray={onBulkSendToQuray}
            onExport={onBulkExport}
          />
        )}
      </div>
      <div className={presetListTableHeaderClassName()}>
        <div className={tableHeaderClassName}>
          <PresetTableSortHeader
            label="Name"
            sortKey="name"
            activeSortKey={sortKey}
            onSort={onSortChange}
          />
          {variant === 'library' && <span>Status</span>}
          <span>Output</span>
          <PresetTableSortHeader
            label="Zones"
            sortKey="zones"
            activeSortKey={sortKey}
            onSort={onSortChange}
          />
          <PresetTableSortHeader
            label="Last updated"
            sortKey="lastUpdated"
            activeSortKey={sortKey}
            onSort={onSortChange}
          />
          <span aria-hidden="true" />
        </div>
      </div>
    </>
  )
}

type PresetListBodyProps = PresetListSharedProps & {
  view: ListView
}

export function PresetListBody({
  presets,
  variant = 'library',
  favourites,
  onToggleFavourite,
  renamingPresetId,
  onPresetAction,
  onRenameSave,
  onRenameCancel,
  onRowClick,
  bulkSelectionEnabled = false,
  selectedIds,
  onToggleSelect,
  sets = [],
  allPresets = [],
  expandedSetId = null,
  onToggleExpand = () => undefined,
  renamingSetId = null,
  onSetAction = () => undefined,
  onSetRenameSave = () => undefined,
  onSetRenameCancel = () => undefined,
  view,
}: PresetListBodyProps) {
  const bulkActive = bulkSelectionEnabled && selectedIds.size > 0
  const presetsById = useMemo(
    () => new Map(allPresets.map((preset) => [preset.id, preset])),
    [allPresets],
  )

  if (view === 'sets') {
    if (sets.length === 0) {
      return (
        <div className={libraryListBodyClassName()}>
          <p className={presetListBodyEmptyClassName()}>No sets match your search</p>
        </div>
      )
    }

    return (
      <div className={libraryListBodyClassName()}>
        <div className={presetListBodyRowsClassName()}>
          {sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              presetsById={presetsById}
              isExpanded={expandedSetId === set.id}
              onToggleExpand={() => onToggleExpand(set.id)}
              isRenaming={renamingSetId === set.id}
              onRenameSave={(name) => onSetRenameSave(set.id, name)}
              onRenameCancel={onSetRenameCancel}
              onSetAction={onSetAction}
            />
          ))}
        </div>
      </div>
    )
  }

  if (presets.length === 0) {
    return (
      <div className={libraryListBodyClassName()}>
        <p className={presetListBodyEmptyClassName()}>No presets match your filters</p>
      </div>
    )
  }

  return (
    <div className={libraryListBodyClassName()}>
      <div className={presetListBodyRowsClassName()}>
      {presets.map((preset) => (
        <PresetRow
          key={preset.id}
          preset={preset}
          variant={variant}
          isFavourite={favourites[preset.id] ?? preset.isFavourite}
          onToggleFavourite={() => onToggleFavourite(preset.id)}
          isRenaming={renamingPresetId === preset.id}
          onRenameSave={(name) => onRenameSave(preset.id, name)}
          onRenameCancel={onRenameCancel}
          onPresetAction={onPresetAction}
          onRowClick={onRowClick ? () => onRowClick(preset.id) : undefined}
          bulkSelectionEnabled={bulkSelectionEnabled}
          bulkActive={bulkActive}
          isSelected={selectedIds.has(preset.id)}
          onToggleSelect={() => onToggleSelect(preset.id)}
        />
      ))}
      </div>
    </div>
  )
}

export function PresetList(props: PresetListProps) {
  const [view, setView] = useState<ListView>('presets')

  return (
    <>
      <PresetListStickyHeader {...props} view={view} onViewChange={setView} />
      <PresetListBody {...props} view={view} />
    </>
  )
}

export type { ListView } from '@/components/library/LibraryViewToggle'
export type { SortDirection, SortKey } from '@/utils/sortPresets'
export {
  presetListStickyHeaderClassName,
  presetListTableHeaderClassName,
  presetListToolbarClassName,
} from '@/components/library/libraryLayout'
