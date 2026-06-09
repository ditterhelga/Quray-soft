import { DeviceInnerPresetActions } from '@/components/device/DeviceSlotActions'
import {
  DEVICE_TABLE_GRID,
  DEVICE_TABLE_STATUS_ACTIONS_SLOT,
  DEVICE_TABLE_STATUS_CELL,
} from '@/components/device/deviceTableLayout'
import {
  deviceInnerPresetRowClassName,
  deviceInnerPresetRowContentClassName,
  deviceSlotInnerRowSpacerClassName,
} from '@/components/device/deviceSlotLayout'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import type { Preset } from '@/types'

type DeviceInnerPresetRowProps = {
  preset: Preset
  deviceSyncStatus: DeviceSyncStatus
  onEdit: () => void
  showDivider?: boolean
  forceHover?: boolean
}

export function DeviceInnerPresetRow({
  preset,
  deviceSyncStatus,
  onEdit,
  showDivider = false,
  forceHover = false,
}: DeviceInnerPresetRowProps) {
  const statusLabel = getSyncStatusLabel(deviceSyncStatus)

  return (
    <article className={deviceInnerPresetRowClassName()}>
      <div className="flex min-w-0">
        <div className={deviceSlotInnerRowSpacerClassName()} aria-hidden="true" />
        <div className={deviceInnerPresetRowContentClassName(showDivider)}>
          <div className={DEVICE_TABLE_GRID}>
            <div className="min-w-0">
              <p className="truncate text-sm font-light leading-none text-text-primary">
                {preset.name}
              </p>
            </div>
            <div className={DEVICE_TABLE_STATUS_CELL}>
              <Tooltip content={statusLabel} className="relative inline-flex shrink-0">
                <span aria-label={statusLabel}>
                  <StatusChip status={deviceSyncStatus} />
                </span>
              </Tooltip>
              <div className={DEVICE_TABLE_STATUS_ACTIONS_SLOT}>
                <DeviceInnerPresetActions onEdit={onEdit} forceHover={forceHover} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
