import { ArrowSquareOut, DotsSixVertical, Minus, Star } from '@phosphor-icons/react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  PRESET_TABLE_ACTIONS_CELL,
  PRESET_TABLE_GRID,
  PRESET_TABLE_GRID_EXPLORE,
  PRESET_TABLE_GRID_PANEL_OPEN,
  PRESET_TABLE_GRID_SETS,
  PRESET_TABLE_OUTPUT_CELL,
  PRESET_TABLE_STATUS_CELL,
} from '@/components/library/presetTableLayout'
import { DeviceSlotKebabMenu } from '@/components/device/DeviceSlotKebabMenu'
import { PresetKebabMenu } from '@/components/library/PresetKebabMenu'
import {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
  presetRowRemoveFromSetButtonClassName,
} from '@/components/library/presetRowActions'
import { formatOutputLabel, OutputChip, ZoneBadge } from '@/components/ui/Badge'
import {
  presetRowCheckboxNameAlignClassName,
  presetRowCheckboxSlotClassName,
  presetRowCheckboxVisibilityClassName,
  presetRowNameWithCheckboxRowClassName,
} from '@/components/library/presetRowSelection'
import {
  StatusChip,
  getSyncStatusLabel,
  type StatusChipValue,
} from '@/components/ui/StatusChip'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { setSyncStatusToChipStatus } from '@/utils/setActions'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import type { Preset, SetSyncStatus } from '@/types'

export function presetRowClassName(
  forceHover = false,
  isRenaming = false,
  nested = false,
) {
  const interactiveClassName = isRenaming
    ? ''
    : 'cursor-pointer hover:bg-bg-row-hover'
  const hoverStateClassName =
    forceHover && !isRenaming ? 'bg-bg-row-hover' : ''

  if (nested) {
    return `group bg-transparent py-8 pr-8 pl-4 transition-colors duration-[120ms] ${interactiveClassName} ${hoverStateClassName}`.trim()
  }

  return `group rounded-lg border border-border bg-bg-active py-6 pr-6 pl-4 transition-colors duration-[120ms] ${interactiveClassName} ${hoverStateClassName}`.trim()
}

export function presetRowSecondaryActionsClassName(forceHover = false) {
  return `flex items-center gap-3 transition-opacity duration-[120ms] ${
    forceHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
  }`
}

export function presetNameClassName(forceHover = false) {
  return `truncate text-lg font-light leading-none text-text-primary transition-colors duration-[120ms] group-hover:text-text-secondary ${
    forceHover ? 'text-text-secondary' : ''
  }`
}

export function presetNameInputClassName() {
  return 'w-full min-w-0 bg-transparent text-lg font-light leading-none text-text-primary outline-none'
}

export {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
} from '@/components/library/presetRowActions'

export function presetRelativeTimeClassName() {
  return 'text-sm font-light font-[300] tabular-nums text-text-primary opacity-70 [font-weight:300]'
}

function DeviceNames({ devices }: { devices: string[] }) {
  const visible = devices.slice(0, 2)
  const overflow = devices.length - visible.length

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-light text-text-muted">
      {visible.map((device) => (
        <span key={device}>{device}</span>
      ))}
      {overflow > 0 && <span>+{overflow}</span>}
    </div>
  )
}

function TagNames({ tags }: { tags: string[] }) {
  return (
    <p className="mt-1 truncate text-sm font-light text-text-muted">
      {tags.join(' · ')}
    </p>
  )
}

function StatusChipCell({ status }: { status: StatusChipValue }) {
  const label = getSyncStatusLabel(status)

  return (
    <Tooltip content={label} className="relative inline-flex shrink-0">
      <span aria-label={label}>
        <StatusChip status={status} />
      </span>
    </Tooltip>
  )
}

function PresetNameLine({
  name,
  forceHover,
}: {
  name: string
  forceHover: boolean
}) {
  return <p className={presetNameClassName(forceHover)}>{name}</p>
}

function PresetNameColumn({
  preset,
  forceHover,
  isRenaming,
  variant,
  bulkSelectionEnabled,
  bulkActive,
  isSelected,
  onToggleSelect,
  onRenameSave,
  onRenameCancel,
  dragHandle,
  dragHandleAttributes,
  dragHandleListeners,
}: {
  preset: Preset
  forceHover: boolean
  isRenaming: boolean
  variant: 'library' | 'explore'
  bulkSelectionEnabled: boolean
  bulkActive: boolean
  isSelected: boolean
  onToggleSelect?: () => void
  onRenameSave?: (name: string) => void
  onRenameCancel?: () => void
  dragHandle?: boolean
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: SyntheticListenerMap
}) {
  const nameBlock = isRenaming ? (
    <PresetNameEditor
      initialName={preset.name}
      onSave={(name) => onRenameSave?.(name)}
      onCancel={() => onRenameCancel?.()}
    />
  ) : (
    <PresetNameLine name={preset.name} forceHover={forceHover} />
  )

  const subLine =
    variant === 'explore' ? (
      <TagNames tags={preset.tags ?? []} />
    ) : (
      <DeviceNames devices={preset.devices} />
    )

  if (bulkSelectionEnabled && bulkActive) {
    return (
      <div className={presetRowNameWithCheckboxRowClassName()}>
        <SelectionCheckbox
          checked={isSelected}
          compact
          onToggle={onToggleSelect}
          ariaLabel={
            isSelected ? `Deselect ${preset.name}` : `Select ${preset.name}`
          }
          className={`${presetRowCheckboxSlotClassName()} ${presetRowCheckboxNameAlignClassName()} ${presetRowCheckboxVisibilityClassName(bulkActive)}`}
        />
        <div className="min-w-0">
          {nameBlock}
          {subLine}
        </div>
      </div>
    )
  }

  if (dragHandle) {
    return (
      <div className={presetRowNameWithCheckboxRowClassName()}>
        <button
          type="button"
          {...dragHandleAttributes}
          {...dragHandleListeners}
          onClick={(event) => event.stopPropagation()}
          className="flex h-4 w-4 shrink-0 cursor-grab touch-none items-center justify-center bg-transparent text-text-muted active:cursor-grabbing"
          aria-label={`Reorder ${preset.name}`}
        >
          <DotsSixVertical size={16} weight="regular" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          {nameBlock}
          {subLine}
        </div>
      </div>
    )
  }

  if (!bulkSelectionEnabled) {
    return (
      <>
        {nameBlock}
        {subLine}
      </>
    )
  }

  return (
    <div className={presetRowNameWithCheckboxRowClassName()}>
      <SelectionCheckbox
        checked={isSelected}
        compact
        onToggle={onToggleSelect}
        ariaLabel={
          isSelected ? `Deselect ${preset.name}` : `Select ${preset.name}`
        }
        className={`${presetRowCheckboxSlotClassName()} ${presetRowCheckboxNameAlignClassName()} ${presetRowCheckboxVisibilityClassName(bulkActive)}`}
      />
      <div className="min-w-0">
        {nameBlock}
        {subLine}
      </div>
    </div>
  )
}

type PresetNameEditorProps = {
  initialName: string
  onSave: (name: string) => void
  onCancel: () => void
}

function PresetNameEditor({ initialName, onSave, onCancel }: PresetNameEditorProps) {
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
      className={presetNameInputClassName()}
      aria-label="Preset name"
    />
  )
}

type PresetRowProps = {
  preset: Preset
  variant?: 'library' | 'explore'
  isFavourite: boolean
  onToggleFavourite: () => void
  isRenaming?: boolean
  onRenameSave?: (name: string) => void
  onRenameCancel?: () => void
  onPresetAction?: (actionId: string, presetId: string) => void
  onRowClick?: () => void
  bulkSelectionEnabled?: boolean
  bulkActive?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  dragHandle?: boolean
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: SyntheticListenerMap
  isDragPlaceholder?: boolean
  isDragOverlay?: boolean
  showZones?: boolean
  showFavourite?: boolean
  forceHover?: boolean
  forceKebabOpen?: boolean
  nested?: boolean
  showOutput?: boolean
  memberSyncStatus?: SetSyncStatus
  deviceSyncStatus?: DeviceSyncStatus
  readOnly?: boolean
  deviceSlotKebab?: {
    showUpdate: boolean
    onAction: (actionId: string) => void
    forceOpen?: boolean
  }
  slotDragHandle?: boolean
  slotDragHandleAttributes?: DraggableAttributes
  slotDragHandleListeners?: SyntheticListenerMap
  panelOpen?: boolean
}

export function PresetRow({
  preset,
  variant = 'library',
  isFavourite,
  onToggleFavourite,
  isRenaming = false,
  onRenameSave,
  onRenameCancel,
  onPresetAction,
  onRowClick,
  bulkSelectionEnabled = false,
  bulkActive = false,
  isSelected = false,
  onToggleSelect,
  dragHandle = false,
  dragHandleAttributes,
  dragHandleListeners,
  isDragPlaceholder = false,
  isDragOverlay = false,
  showZones = true,
  showFavourite = true,
  forceHover = false,
  forceKebabOpen = false,
  nested = false,
  showOutput = true,
  memberSyncStatus,
  deviceSyncStatus,
  readOnly = false,
  deviceSlotKebab,
  slotDragHandle = false,
  slotDragHandleAttributes,
  slotDragHandleListeners,
  panelOpen = false,
}: PresetRowProps) {
  function handleRowClick() {
    if (isRenaming || readOnly) {
      return
    }

    if (onRowClick) {
      onRowClick()
      return
    }

    console.log('Open preset', preset.id)
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isRenaming || readOnly) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRowClick()
    }
  }

  function handleOpenInEditor(event: MouseEvent) {
    event.stopPropagation()

    if (nested) {
      onPresetAction?.('open', preset.id)
      return
    }

    console.log('Open in editor', preset.id)
  }

  function handleRemoveFromSet(event: MouseEvent) {
    event.stopPropagation()
    onPresetAction?.('remove-from-set', preset.id)
  }

  function handlePresetAction(actionId: string, presetId: string) {
    onPresetAction?.(actionId, presetId)
  }

  const favouriteTooltip = isFavourite ? 'Remove from favourites' : 'Add to favourites'
  const rowAriaLabel = `Open preset ${preset.name}`

  const dragStateClassName = isDragPlaceholder
    ? 'opacity-40'
    : isDragOverlay
      ? 'shadow-lg'
      : ''

  const gridClassName =
    panelOpen
      ? PRESET_TABLE_GRID_PANEL_OPEN
      : variant === 'explore'
        ? PRESET_TABLE_GRID_EXPLORE
        : showZones
          ? PRESET_TABLE_GRID
          : PRESET_TABLE_GRID_SETS

  const statusChipValue: StatusChipValue = deviceSyncStatus
    ?? (memberSyncStatus
      ? setSyncStatusToChipStatus(memberSyncStatus)
      : preset.syncStatus)

  return (
    <article
      className={`${presetRowClassName(forceHover, isRenaming, nested)} ${dragStateClassName}`.trim()}
      onClick={isDragOverlay || readOnly ? undefined : handleRowClick}
      onKeyDown={isDragOverlay || readOnly ? undefined : handleRowKeyDown}
      role={isRenaming || isDragOverlay || readOnly ? undefined : 'button'}
      tabIndex={isRenaming || isDragOverlay || readOnly ? -1 : 0}
      aria-label={isRenaming || isDragOverlay || readOnly ? undefined : rowAriaLabel}
    >
      <div className={gridClassName}>
        <div className="min-w-0">
          <PresetNameColumn
            preset={preset}
            forceHover={forceHover}
            isRenaming={isRenaming}
            variant={variant}
            bulkSelectionEnabled={dragHandle ? false : bulkSelectionEnabled}
            bulkActive={bulkActive}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            onRenameSave={onRenameSave}
            onRenameCancel={onRenameCancel}
            dragHandle={dragHandle || (slotDragHandle && !bulkActive)}
            dragHandleAttributes={dragHandleAttributes ?? slotDragHandleAttributes}
            dragHandleListeners={dragHandleListeners ?? slotDragHandleListeners}
          />
        </div>

        {!panelOpen && variant === 'library' && (
          <div className={PRESET_TABLE_STATUS_CELL}>
            <StatusChipCell status={statusChipValue} />
          </div>
        )}

        {!panelOpen && showOutput && variant === 'library' && <div aria-hidden="true" />}

        {!panelOpen && showOutput && (
          <div className={PRESET_TABLE_OUTPUT_CELL}>
            {preset.outputTypes.map((outputType) => (
              <OutputChip key={outputType} label={formatOutputLabel(outputType)} />
            ))}
          </div>
        )}

        {!panelOpen && showZones && (
          <div>
            <ZoneBadge count={preset.zoneCount} />
          </div>
        )}

        {!panelOpen && (
          <div className={presetRelativeTimeClassName()}>
            {formatRelativeTime(preset.lastUpdated)}
          </div>
        )}

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
        ) : readOnly ? (
          <span aria-hidden="true" />
        ) : (
        <div className={PRESET_TABLE_ACTIONS_CELL}>
          {showFavourite && (
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
          )}
          <div className={presetRowSecondaryActionsClassName(forceHover)}>
            {nested && !isDragOverlay && (
              <Tooltip content="Remove from set" className={presetRowActionTooltipClassName}>
                <button
                  type="button"
                  onClick={handleRemoveFromSet}
                  className={presetRowRemoveFromSetButtonClassName()}
                  aria-label="Remove from set"
                >
                  <Minus size={18} weight="regular" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Open in editor" className={presetRowActionTooltipClassName}>
              <button
                type="button"
                onClick={handleOpenInEditor}
                className={presetRowActionButtonClassName()}
                aria-label="Open in editor"
              >
                <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
              </button>
            </Tooltip>
            <PresetKebabMenu
              presetId={preset.id}
              variant={nested ? 'nested-set' : variant}
              forceOpen={forceKebabOpen}
              onItemSelect={handlePresetAction}
            />
          </div>
        </div>
        )}
      </div>
    </article>
  )
}

export { SYNC_STATUS_META } from '@/components/ui/StatusChip'
