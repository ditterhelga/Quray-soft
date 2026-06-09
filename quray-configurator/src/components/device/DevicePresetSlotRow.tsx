import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DeviceSlotActions } from '@/components/device/DeviceSlotActions'
import { DeviceSlotLeading } from '@/components/device/DeviceSlotLeading'
import {
  DEVICE_TABLE_GRID,
  DEVICE_TABLE_STATUS_ACTIONS_SLOT,
  DEVICE_TABLE_STATUS_CELL,
} from '@/components/device/deviceTableLayout'
import {
  deviceSlotLeadingGapClassName,
  deviceSlotRowClassName,
} from '@/components/device/deviceSlotLayout'
import { presetNameClassName } from '@/components/library/PresetRow'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import type { Preset } from '@/types'

type DevicePresetSlotRowProps = {
  preset: Preset
  sequenceIndex: number
  deviceSyncStatus: DeviceSyncStatus
  bulkActive: boolean
  isSelected: boolean
  onToggleSelect?: () => void
  onEdit: () => void
  onRemove: () => void
  isDragPlaceholder?: boolean
  isDragOverlay?: boolean
  forceHover?: boolean
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: SyntheticListenerMap
}

export function DevicePresetSlotRow({
  preset,
  sequenceIndex,
  deviceSyncStatus,
  bulkActive,
  isSelected,
  onToggleSelect,
  onEdit,
  onRemove,
  isDragPlaceholder = false,
  isDragOverlay = false,
  forceHover = false,
  dragHandleAttributes,
  dragHandleListeners,
}: DevicePresetSlotRowProps) {
  const statusLabel = getSyncStatusLabel(deviceSyncStatus)
  const selectLabel = isSelected ? `Deselect ${preset.name}` : `Select ${preset.name}`

  return (
    <article className={deviceSlotRowClassName(isDragPlaceholder)}>
      <div className={DEVICE_TABLE_GRID}>
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
          <p className={`${presetNameClassName(false)} min-w-0 flex-1 truncate ${deviceSlotLeadingGapClassName()}`}>
            {preset.name}
          </p>
        </div>

        <div className={DEVICE_TABLE_STATUS_CELL}>
          <Tooltip content={statusLabel} className="relative inline-flex shrink-0">
            <span aria-label={statusLabel}>
              <StatusChip status={deviceSyncStatus} />
            </span>
          </Tooltip>
          {!isDragOverlay && (
            <div className={DEVICE_TABLE_STATUS_ACTIONS_SLOT}>
              <DeviceSlotActions
                variant="preset"
                onEdit={onEdit}
                onRemove={onRemove}
                forceHover={forceHover}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
