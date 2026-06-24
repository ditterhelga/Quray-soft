import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { CaretDown, CaretRight } from '@phosphor-icons/react'
import { DeviceInnerPresetRow } from '@/components/device/DeviceInnerPresetRow'
import { DeviceSlotActions } from '@/components/device/DeviceSlotActions'
import { DeviceSlotLeading } from '@/components/device/DeviceSlotLeading'
import {
  DEVICE_TABLE_GRID,
  DEVICE_TABLE_STATUS_ACTIONS_SLOT,
  DEVICE_TABLE_STATUS_CELL,
} from '@/components/device/deviceTableLayout'
import {
  deviceSetExpandedGroupClassName,
  deviceSetExpandedPresetsClassName,
  deviceSlotInnerRowSpacerClassName,
  deviceSlotLeadingGapClassName,
  deviceSlotRowClassName,
} from '@/components/device/deviceSlotLayout'
import { presetNameClassName } from '@/components/library/PresetRow'
import {
  setRowExpandedClassName,
  setRowExpandedInnerClassName,
  setRowSubtitleClassName,
  setRowUnitClassName,
} from '@/components/library/SetRow'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import type { Preset, Set as LibrarySet } from '@/types'
import type { KeyboardEvent, MouseEvent } from 'react'

type DeviceSetSlotRowProps = {
  set: LibrarySet
  sequenceIndex: number
  presetsById: Map<string, Preset>
  devicePresetSyncById: Map<string, DeviceSyncStatus>
  deviceSyncStatus: DeviceSyncStatus
  isExpanded: boolean
  bulkActive: boolean
  isSelected: boolean
  onToggleSelect?: () => void
  onToggleExpand: () => void
  onEdit: () => void
  onRemove: () => void
  onEditInnerPreset: (presetId: string) => void
  isDragPlaceholder?: boolean
  isDragOverlay?: boolean
  forceHover?: boolean
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: SyntheticListenerMap
}

export function DeviceSetSlotRow({
  set,
  sequenceIndex,
  presetsById,
  devicePresetSyncById,
  deviceSyncStatus,
  isExpanded,
  bulkActive,
  isSelected,
  onToggleSelect,
  onToggleExpand,
  onEdit,
  onRemove,
  onEditInnerPreset,
  isDragPlaceholder = false,
  isDragOverlay = false,
  forceHover = false,
  dragHandleAttributes,
  dragHandleListeners,
}: DeviceSetSlotRowProps) {
  const statusLabel = getSyncStatusLabel(deviceSyncStatus)
  const presetCount = set.members.length
  const selectLabel = isSelected ? `Deselect ${set.name}` : `Select ${set.name}`

  const innerPresets = set.members
    .map((member) => {
      const preset = presetsById.get(member.presetId)
      if (!preset) {
        return null
      }

      return {
        preset,
        deviceSyncStatus: devicePresetSyncById.get(member.presetId) ?? 'current',
      }
    })
    .filter(
      (entry): entry is { preset: Preset; deviceSyncStatus: DeviceSyncStatus } =>
        entry !== null,
    )

  function handleRowClick() {
    onToggleExpand()
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleExpand()
    }
  }

  return (
    <div className={setRowUnitClassName(isExpanded)}>
      <article
        className={`${deviceSlotRowClassName(isDragPlaceholder)} relative overflow-hidden`}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} set ${set.name}`}
      >
        <span
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-accent opacity-40"
          aria-hidden="true"
        />
        <div className={DEVICE_TABLE_GRID}>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center">
              <DeviceSlotLeading
                sequenceIndex={sequenceIndex}
                bulkActive={bulkActive}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
                selectLabel={selectLabel}
                dragHandleAttributes={dragHandleAttributes}
                dragHandleListeners={dragHandleListeners}
              />
              <div
                className={`inline-flex min-w-0 items-center gap-2 ${deviceSlotLeadingGapClassName()}`}
              >
                <span className={`${presetNameClassName(false)} truncate`}>{set.name}</span>
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
              </div>
            </div>
            <div className="flex min-w-0">
              <div className={deviceSlotInnerRowSpacerClassName()} aria-hidden="true" />
              <p className={setRowSubtitleClassName()}>
                {presetCount} preset{presetCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div
            className={`${DEVICE_TABLE_STATUS_CELL} self-center`}
            onClick={(event: MouseEvent) => event.stopPropagation()}
          >
            <Tooltip content={statusLabel} className="relative inline-flex shrink-0">
              <span aria-label={statusLabel}>
                <StatusChip status={deviceSyncStatus} />
              </span>
            </Tooltip>
            {!isDragOverlay && (
              <div className={DEVICE_TABLE_STATUS_ACTIONS_SLOT}>
                <DeviceSlotActions
                  variant="set"
                  onEdit={onEdit}
                  onRemove={onRemove}
                  forceHover={forceHover}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      <div className={setRowExpandedClassName(isExpanded)}>
        <div className={setRowExpandedInnerClassName()}>
          <div className={deviceSetExpandedGroupClassName()}>
            <div className={deviceSetExpandedPresetsClassName()}>
              {innerPresets.map(({ preset, deviceSyncStatus: memberStatus }, index) => (
                <DeviceInnerPresetRow
                  key={`${set.id}-${preset.id}`}
                  preset={preset}
                  deviceSyncStatus={memberStatus}
                  onEdit={() => onEditInnerPreset(preset.id)}
                  showDivider={index > 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
