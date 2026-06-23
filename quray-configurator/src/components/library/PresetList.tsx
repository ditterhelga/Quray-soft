import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { BulkActionBar } from '@/components/library/BulkActionBar'
import { LibraryViewToggle, type ListView } from '@/components/library/LibraryViewToggle'
import {
  presetListBodyRowsClassName,
  presetListTableHeaderClassName,
  presetListToolbarClassName,
  libraryListBodyClassName,
} from '@/components/library/libraryLayout'
import { PresetTableSelectAllCheckbox } from '@/components/library/PresetTableSelectAllCheckbox'
import { presetRowNameWithCheckboxClassName } from '@/components/library/presetRowSelection'
import { PresetTableSortHeader } from '@/components/library/PresetTableSortHeader'
import { PresetRow } from '@/components/library/PresetRow'
import { SetRow } from '@/components/library/SetRow'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import {
  PRESET_TABLE_HEADER,
  PRESET_TABLE_HEADER_EXPLORE,
  PRESET_TABLE_HEADER_PANEL_OPEN,
  PRESET_TABLE_HEADER_SETS,
  PRESET_TABLE_STATUS_HEADER_CELL,
  PRESET_TABLE_ZONES_CELL_LIBRARY,
} from '@/components/library/presetTableLayout'
import type { SortKey } from '@/utils/sortPresets'
import type { Preset, Set as LibrarySet } from '@/types'

type SetListProps = {
  sets?: LibrarySet[]
  allPresets?: Preset[]
  expandedSetIds?: Set<string>
  onToggleExpand?: (setId: string) => void
  onReorderPresets?: (setId: string, presetIds: string[]) => void
  renamingSetId?: string | null
  onSetAction?: (actionId: string, setId: string) => void
  onSetRenameSave?: (setId: string, name: string) => void
  onSetRenameCancel?: () => void
  onToggleSetFavourite?: (setId: string) => void
  onSetPresetAction?: (actionId: string, setId: string, presetId: string) => void
  onAddPresetToSet?: (setId: string) => void
  onNewSet?: () => void
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
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkSendToQuray: () => void
  onBulkExport: () => void
  panelOpen?: boolean
} & SetListProps

type PresetListProps = PresetListSharedProps

type PresetListStickyHeaderProps = PresetListSharedProps & {
  view: ListView
  onViewChange: (view: ListView) => void
  onNewSet?: () => void
}

export function PresetListStickyHeader({
  presets,
  sets = [],
  variant = 'library',
  sortKey,
  onSortChange,
  bulkSelectionEnabled = false,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onBulkSendToQuray,
  onBulkExport,
  panelOpen = false,
  view,
  onViewChange,
  onNewSet,
}: PresetListStickyHeaderProps) {
  const selectedCount = selectedIds.size
  const tableHeaderClassName =
    panelOpen
      ? PRESET_TABLE_HEADER_PANEL_OPEN
      : variant === 'explore'
        ? PRESET_TABLE_HEADER_EXPLORE
        : PRESET_TABLE_HEADER
  const effectiveView = variant === 'explore' ? 'presets' : view
  const listCount = effectiveView === 'sets' ? sets.length : presets.length
  const showViewToggle = variant !== 'explore'

  if (effectiveView === 'sets') {
    return (
      <>
        {(showViewToggle || bulkSelectionEnabled) && (
          <div className={presetListToolbarClassName()}>
            {showViewToggle && (
              <LibraryViewToggle value={view} onChange={onViewChange} onNewSet={onNewSet} />
            )}
            {bulkSelectionEnabled && (
              <BulkActionBar
                selectedCount={selectedCount}
                totalCount={listCount}
                onSelectAll={onSelectAll}
                onClear={onClearSelection}
                onSendToQuray={onBulkSendToQuray}
                onExport={onBulkExport}
              />
            )}
          </div>
        )}
        {sets.length > 0 && (
        <div className={presetListTableHeaderClassName()}>
          <div className={PRESET_TABLE_HEADER_SETS}>
            <div className={presetRowNameWithCheckboxClassName()}>
              {bulkSelectionEnabled && (
                <PresetTableSelectAllCheckbox
                  selectedCount={selectedCount}
                  totalCount={listCount}
                  onSelectAll={onSelectAll}
                  onClearSelection={onClearSelection}
                />
              )}
              <PresetTableSortHeader
                label="Name"
                sortKey="name"
                activeSortKey={sortKey}
                onSort={onSortChange}
              />
            </div>
            <span aria-hidden="true" />
            <span aria-hidden="true" className={PRESET_TABLE_ZONES_CELL_LIBRARY} />
            <div className="flex justify-center">
              <PresetTableSortHeader
                label="Last updated"
                sortKey="lastUpdated"
                activeSortKey={sortKey}
                onSort={onSortChange}
              />
            </div>
            <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
            <span aria-hidden="true" />
          </div>
        </div>
        )}
      </>
    )
  }

  return (
    <>
      {(showViewToggle || bulkSelectionEnabled) && (
        <div className={presetListToolbarClassName()}>
          {showViewToggle && (
            <LibraryViewToggle value={view} onChange={onViewChange} onNewSet={onNewSet} />
          )}
          {bulkSelectionEnabled && (
            <BulkActionBar
              selectedCount={selectedCount}
              totalCount={listCount}
              onSelectAll={onSelectAll}
              onClear={onClearSelection}
              onSendToQuray={onBulkSendToQuray}
              onExport={onBulkExport}
            />
          )}
        </div>
      )}
      <div className={presetListTableHeaderClassName()}>
        <div className={tableHeaderClassName}>
          <div className={presetRowNameWithCheckboxClassName()}>
            {bulkSelectionEnabled && (
              <PresetTableSelectAllCheckbox
                selectedCount={selectedCount}
                totalCount={listCount}
                onSelectAll={onSelectAll}
                onClearSelection={onClearSelection}
              />
            )}
            <PresetTableSortHeader
              label="Name"
              sortKey="name"
              activeSortKey={sortKey}
              onSort={onSortChange}
            />
          </div>
          {!panelOpen && variant === 'library' && <span aria-hidden="true" />}
          {!panelOpen && (
            <div className="flex justify-center">
              <PresetTableSortHeader
                label="Zones"
                sortKey="zones"
                activeSortKey={sortKey}
                onSort={onSortChange}
              />
            </div>
          )}
          {!panelOpen && (
            <div className="flex justify-center">
              <PresetTableSortHeader
                label="Last updated"
                sortKey="lastUpdated"
                activeSortKey={sortKey}
                onSort={onSortChange}
              />
            </div>
          )}
          {!panelOpen && variant === 'library' && (
            <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
          )}
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
  expandedSetIds = new Set(),
  onToggleExpand = () => undefined,
  onReorderPresets = () => undefined,
  renamingSetId = null,
  onSetAction = () => undefined,
  onSetRenameSave = () => undefined,
  onSetRenameCancel = () => undefined,
  onToggleSetFavourite = () => undefined,
  onSetPresetAction = () => undefined,
  onAddPresetToSet = () => undefined,
  onNewSet,
  view,
  panelOpen = false,
}: PresetListBodyProps) {
  const bulkActive = bulkSelectionEnabled && selectedIds.size > 0
  const presetsById = useMemo(
    () => new Map(allPresets.map((preset) => [preset.id, preset])),
    [allPresets],
  )

  const effectiveView = variant === 'explore' ? 'presets' : view

  if (effectiveView === 'sets') {
    if (sets.length === 0) {
      return (
        <div className={libraryListBodyClassName()}>
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
            <p className="text-base font-light text-text-primary">No sets yet</p>
            <p className="max-w-xs text-sm font-light text-text-muted">
              Group presets into sets to load them to Quray in one action
            </p>
            {onNewSet && (
              <button
                type="button"
                onClick={onNewSet}
                className={libraryOutlinedButtonClassName()}
              >
                <Plus size={16} weight="regular" aria-hidden="true" />
                New set
              </button>
            )}
          </div>
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
              isExpanded={expandedSetIds.has(set.id)}
              onToggleExpand={() => onToggleExpand(set.id)}
              isFavourite={favourites[set.id] ?? false}
              onToggleFavourite={() => onToggleSetFavourite(set.id)}
              isRenaming={renamingSetId === set.id}
              onRenameSave={(name) => onSetRenameSave(set.id, name)}
              onRenameCancel={onSetRenameCancel}
              onSetAction={onSetAction}
              onPresetRowClick={onRowClick}
              onSetPresetAction={onSetPresetAction}
              onAddPresetToSet={onAddPresetToSet}
              onReorderPresets={onReorderPresets}
              bulkSelectionEnabled={bulkSelectionEnabled}
              bulkActive={bulkActive}
              isSelected={selectedIds.has(set.id)}
              onToggleSelect={() => onToggleSelect(set.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (presets.length === 0) {
    return (
      <div className={libraryListBodyClassName()}>
        <div className="flex flex-col gap-2 px-4 py-10">
          <p className="text-base font-light text-text-primary">No presets match your filters</p>
          <p className="text-sm font-light text-text-muted">Try adjusting or clearing your filters</p>
        </div>
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
          panelOpen={panelOpen}
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
