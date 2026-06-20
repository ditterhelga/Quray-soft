import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { ArrowSquareOut, CaretDown, CaretRight, DotsSixVertical, Plus, Star } from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { DeviceSlotKebabMenu } from '@/components/device/DeviceSlotKebabMenu'
import { SetKebabMenu } from '@/components/library/SetKebabMenu'
import {
  PRESET_TABLE_ACTIONS_CELL,
  PRESET_TABLE_GRID_SETS,
  PRESET_TABLE_OUTPUT_CELL_OFFSET,
  PRESET_TABLE_STATUS_CELL,
  PRESET_TABLE_ZONES_CELL_LIBRARY,
} from '@/components/library/presetTableLayout'
import {
  presetNameClassName,
  presetNameInputClassName,
  presetRelativeTimeClassName,
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowClassName,
  presetRowFavouriteButtonClassName,
  PresetRow,
  presetRowSecondaryActionsClassName,
} from '@/components/library/PresetRow'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import {
  presetRowCheckboxNameAlignClassName,
  presetRowCheckboxSlotClassName,
  presetRowCheckboxVisibilityClassName,
  presetRowNameWithCheckboxRowClassName,
} from '@/components/library/presetRowSelection'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { Tooltip } from '@/components/ui/Tooltip'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import {
  aggregateDeviceSyncStatus,
  getDevicePresetSyncStatus,
} from '@/utils/deviceSyncStatus'
import { aggregateSetSyncStatus, getSetPresetIds } from '@/utils/setMembers'
import { setSyncStatusToChipStatus } from '@/utils/setActions'
import type { StatusChipValue } from '@/components/ui/StatusChip'
import type { Preset, Set as LibrarySet, SetSyncStatus } from '@/types'

export function setRowSubtitleClassName() {
  return 'mt-1 text-sm font-light text-text-muted'
}

export function setRowUnitClassName(isExpanded: boolean) {
  return isExpanded ? 'pb-6' : ''
}

export function setRowExpandedClassName(isExpanded: boolean) {
  return `grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
  }`
}

export function setRowExpandedInnerClassName() {
  return 'overflow-hidden'
}

export function setRowExpandedGroupClassName() {
  return 'mt-4 pl-8'
}

export function setRowExpandedPresetsClassName() {
  return 'flex flex-col divide-y divide-border'
}

export function setRowAddPresetButtonClassName() {
  return libraryOutlinedButtonClassName()
}

function SetNameEditor({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)
  const committedRef = useRef(false)

  useEffect(() => {
    const input = inputRef.current
    input?.focus()
    input?.select()
  }, [])

  function commit() {
    if (committedRef.current) {
      return
    }

    committedRef.current = true
    onSave(value)
  }

  function cancel() {
    if (committedRef.current) {
      return
    }

    committedRef.current = true
    onCancel()
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()

        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          cancel()
        }
      }}
      onBlur={() => commit()}
      className={`${presetNameInputClassName()} max-w-[min(100%,20rem)]`}
      aria-label="Set name"
    />
  )
}

type SortableSetPresetRowProps = {
  preset: Preset
  memberSyncStatus: SetSyncStatus
  onPresetRowClick?: () => void
  onPresetAction?: (actionId: string, presetId: string) => void
}

function SortableSetPresetRow({
  preset,
  memberSyncStatus,
  onPresetRowClick,
  onPresetAction,
}: SortableSetPresetRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preset.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PresetRow
        preset={preset}
        isFavourite={false}
        onToggleFavourite={() => undefined}
        showZones={false}
        showFavourite={false}
        showOutput={false}
        memberSyncStatus={memberSyncStatus}
        nested
        onRowClick={onPresetRowClick}
        onPresetAction={onPresetAction}
        dragHandle
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        isDragPlaceholder={isDragging}
      />
    </div>
  )
}

type SetExpandedPresetsProps = {
  set: LibrarySet
  presetsById: Map<string, Preset>
  onPresetRowClick?: (presetId: string) => void
  onPresetAction?: (actionId: string, presetId: string) => void
  onReorderPresets?: (setId: string, presetIds: string[]) => void
  onAddPreset?: () => void
  readOnly?: boolean
  devicePresetSyncById?: Map<string, DeviceSyncStatus>
}

function SetExpandedPresets({
  set,
  presetsById,
  onPresetRowClick,
  onPresetAction,
  onReorderPresets,
  onAddPreset,
  readOnly = false,
  devicePresetSyncById,
}: SetExpandedPresetsProps) {
  const [activePresetId, setActivePresetId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const presetIds = getSetPresetIds(set)

  const sortablePresets = set.members
    .map((member) => {
      const preset = presetsById.get(member.presetId)
      if (!preset) {
        return null
      }

      return { preset, memberSyncStatus: member.syncStatus }
    })
    .filter(
      (entry): entry is { preset: Preset; memberSyncStatus: SetSyncStatus } =>
        entry !== null,
    )

  const activePreset = activePresetId ? presetsById.get(activePresetId) : undefined

  function handleDragStart(event: DragStartEvent) {
    setActivePresetId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePresetId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = presetIds.indexOf(String(active.id))
    const newIndex = presetIds.indexOf(String(over.id))

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onReorderPresets?.(set.id, arrayMove(presetIds, oldIndex, newIndex))
  }

  function handleDragCancel() {
    setActivePresetId(null)
  }

  if (readOnly) {
    return (
      <div className={setRowExpandedPresetsClassName()}>
        {sortablePresets.map(({ preset, memberSyncStatus }) => (
          <PresetRow
            key={`${set.id}-${preset.id}`}
            preset={preset}
            isFavourite={false}
            onToggleFavourite={() => undefined}
            showZones={false}
            showFavourite={false}
            showOutput={false}
            memberSyncStatus={devicePresetSyncById ? undefined : memberSyncStatus}
            deviceSyncStatus={
              devicePresetSyncById
                ? getDevicePresetSyncStatus(preset.id)
                : undefined
            }
            nested
            readOnly
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={presetIds} strategy={verticalListSortingStrategy}>
        <div className={setRowExpandedPresetsClassName()}>
          {sortablePresets.map(({ preset, memberSyncStatus }) => (
            <SortableSetPresetRow
              key={`${set.id}-${preset.id}`}
              preset={preset}
              memberSyncStatus={memberSyncStatus}
              onPresetRowClick={
                onPresetRowClick ? () => onPresetRowClick(preset.id) : undefined
              }
              onPresetAction={onPresetAction}
            />
          ))}
        </div>
      </SortableContext>

      <div className="py-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAddPreset?.()
          }}
          className={setRowAddPresetButtonClassName()}
        >
          <Plus size={16} weight="regular" aria-hidden="true" />
          Add preset
        </button>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePreset ? (
          <PresetRow
            preset={activePreset}
            isFavourite={false}
            onToggleFavourite={() => undefined}
            showZones={false}
            showFavourite={false}
            nested
            dragHandle
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

type SetRowProps = {
  set: LibrarySet
  presetsById: Map<string, Preset>
  isExpanded: boolean
  onToggleExpand: () => void
  isFavourite: boolean
  onToggleFavourite: () => void
  isRenaming?: boolean
  onRenameSave?: (name: string) => void
  onRenameCancel?: () => void
  onSetAction?: (actionId: string, setId: string) => void
  onPresetRowClick?: (presetId: string) => void
  onSetPresetAction?: (actionId: string, setId: string, presetId: string) => void
  onAddPresetToSet?: (setId: string) => void
  onReorderPresets?: (setId: string, presetIds: string[]) => void
  bulkSelectionEnabled?: boolean
  bulkActive?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  forceHover?: boolean
  forceKebabOpen?: boolean
  readOnly?: boolean
  devicePresetSyncById?: Map<string, DeviceSyncStatus>
  deviceSlotKebab?: {
    showUpdate: boolean
    onAction: (actionId: string) => void
    forceOpen?: boolean
  }
  slotDragHandle?: boolean
  slotDragHandleAttributes?: DraggableAttributes
  slotDragHandleListeners?: SyntheticListenerMap
  isDragPlaceholder?: boolean
}

export function SetRow({
  set,
  presetsById,
  isExpanded,
  onToggleExpand,
  isFavourite,
  onToggleFavourite,
  isRenaming = false,
  onRenameSave,
  onRenameCancel,
  onSetAction,
  onPresetRowClick,
  onSetPresetAction,
  onAddPresetToSet,
  onReorderPresets,
  bulkSelectionEnabled = false,
  bulkActive = false,
  isSelected = false,
  onToggleSelect,
  forceHover = false,
  forceKebabOpen = false,
  readOnly = false,
  devicePresetSyncById,
  deviceSlotKebab,
  slotDragHandle = false,
  slotDragHandleAttributes,
  slotDragHandleListeners,
  isDragPlaceholder = false,
}: SetRowProps) {
  const aggregateStatus = aggregateSetSyncStatus(set.members)
  const libraryChipStatus = setSyncStatusToChipStatus(aggregateStatus)
  const deviceSetSyncStatus = devicePresetSyncById
    ? aggregateDeviceSyncStatus(
        set.members.map(
          (member) => devicePresetSyncById.get(member.presetId) ?? 'current',
        ),
      )
    : undefined
  const chipStatus: StatusChipValue = deviceSetSyncStatus ?? libraryChipStatus
  const statusLabel = getSyncStatusLabel(chipStatus)
  const presetCount = set.members.length
  const favouriteTooltip = isFavourite ? 'Remove from favourites' : 'Add to favourites'

  function handleRowClick() {
    if (isRenaming) {
      return
    }

    onToggleExpand()
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isRenaming) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleExpand()
    }
  }

  function handleOpenInEditor(event: MouseEvent) {
    event.stopPropagation()
    onSetAction?.('open-editor', set.id)
  }

  function handleSetAction(actionId: string, setId: string) {
    onSetAction?.(actionId, setId)
  }

  function handleSetPresetAction(actionId: string, presetId: string) {
    onSetPresetAction?.(actionId, set.id, presetId)
  }

  function renderSetTitleBlock() {
    return (
      <div className="min-w-0">
        <div className="inline-flex max-w-full items-center gap-2">
          {isRenaming ? (
            <SetNameEditor
              initialName={set.name}
              onSave={(name) => onRenameSave?.(name)}
              onCancel={() => onRenameCancel?.()}
            />
          ) : (
            <>
              <span className={`${presetNameClassName(forceHover)} truncate`}>{set.name}</span>
              {isExpanded ? (
                <CaretDown
                  size={16}
                  weight="bold"
                  className="shrink-0 text-text-muted"
                  aria-hidden="true"
                />
              ) : (
                <CaretRight
                  size={16}
                  weight="bold"
                  className="shrink-0 text-text-muted"
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </div>
        <p className={setRowSubtitleClassName()}>
          {presetCount} preset{presetCount === 1 ? '' : 's'}
        </p>
      </div>
    )
  }

  return (
    <div className={setRowUnitClassName(isExpanded)}>
      <article
        id={`library-set-${set.id}`}
        className={`group ${presetRowClassName(forceHover, isRenaming)} ${isDragPlaceholder ? 'opacity-40' : ''}`.trim()}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        role={isRenaming ? undefined : 'button'}
        tabIndex={isRenaming ? -1 : 0}
        aria-expanded={isRenaming ? undefined : isExpanded}
        aria-label={
          isRenaming ? undefined : `${isExpanded ? 'Collapse' : 'Expand'} set ${set.name}`
        }
      >
        <div className={PRESET_TABLE_GRID_SETS}>
          <div className="min-w-0">
            {bulkSelectionEnabled ? (
              <div className={presetRowNameWithCheckboxRowClassName()}>
                <SelectionCheckbox
                  checked={isSelected}
                  compact
                  onToggle={onToggleSelect}
                  ariaLabel={
                    isSelected ? `Deselect ${set.name}` : `Select ${set.name}`
                  }
                  className={`${presetRowCheckboxSlotClassName()} ${presetRowCheckboxNameAlignClassName()} ${presetRowCheckboxVisibilityClassName(bulkActive)}`}
                />
                {renderSetTitleBlock()}
              </div>
            ) : slotDragHandle ? (
              <div className={presetRowNameWithCheckboxRowClassName()}>
                <button
                  type="button"
                  {...slotDragHandleAttributes}
                  {...slotDragHandleListeners}
                  onClick={(event) => event.stopPropagation()}
                  className="flex h-4 w-4 shrink-0 cursor-grab touch-none items-center justify-center bg-transparent text-text-muted active:cursor-grabbing"
                  aria-label={`Reorder ${set.name}`}
                >
                  <DotsSixVertical size={16} weight="regular" aria-hidden="true" />
                </button>
                {renderSetTitleBlock()}
              </div>
            ) : (
              renderSetTitleBlock()
            )}
          </div>

          <span aria-hidden="true" />
          <span aria-hidden="true" className={PRESET_TABLE_OUTPUT_CELL_OFFSET} />
          <span aria-hidden="true" className={PRESET_TABLE_ZONES_CELL_LIBRARY} />

          <div className={presetRelativeTimeClassName()}>
            {formatRelativeTime(set.lastUpdated.toISOString().slice(0, 10))}
          </div>

          <div className={PRESET_TABLE_STATUS_CELL}>
            <Tooltip content={statusLabel} className="relative inline-flex shrink-0">
              <span aria-label={statusLabel}>
                <StatusChip status={chipStatus} />
              </span>
            </Tooltip>
          </div>

          {readOnly && deviceSlotKebab ? (
            <div className={PRESET_TABLE_ACTIONS_CELL}>
              <div className={presetRowSecondaryActionsClassName(forceHover)}>
                <DeviceSlotKebabMenu
                  showUpdate={deviceSlotKebab.showUpdate}
                  forceOpen={deviceSlotKebab.forceOpen}
                  onItemSelect={deviceSlotKebab.onAction}
                />
              </div>
            </div>
          ) : !readOnly ? (
            <div className={PRESET_TABLE_ACTIONS_CELL}>
              <Tooltip
                content={favouriteTooltip}
                className={presetRowActionTooltipClassName}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggleFavourite()
                  }}
                  className={presetRowFavouriteButtonClassName()}
                  aria-label={favouriteTooltip}
                  aria-pressed={isFavourite}
                >
                  <Star
                    size={18}
                    weight={isFavourite ? 'fill' : 'regular'}
                    aria-hidden="true"
                  />
                </button>
              </Tooltip>
              <div className={presetRowSecondaryActionsClassName(forceHover)}>
                <Tooltip content="Open set editor" className={presetRowActionTooltipClassName}>
                  <button
                    type="button"
                    onClick={handleOpenInEditor}
                    className={presetRowActionButtonClassName()}
                    aria-label="Open set editor"
                  >
                    <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
                  </button>
                </Tooltip>
                <SetKebabMenu
                  setId={set.id}
                  forceOpen={forceKebabOpen}
                  onItemSelect={handleSetAction}
                />
              </div>
            </div>
          ) : readOnly ? (
            <span aria-hidden="true" />
          ) : null}
        </div>
      </article>

      <div className={setRowExpandedClassName(isExpanded)}>
        <div className={setRowExpandedInnerClassName()}>
          <div className={setRowExpandedGroupClassName()}>
            <SetExpandedPresets
              set={set}
              presetsById={presetsById}
              onPresetRowClick={onPresetRowClick}
              onPresetAction={handleSetPresetAction}
              onReorderPresets={onReorderPresets}
              onAddPreset={() => onAddPresetToSet?.(set.id)}
              readOnly={readOnly}
              devicePresetSyncById={devicePresetSyncById}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
