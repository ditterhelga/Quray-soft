import StatusModifiedIcon from '@/assets/icons/status-modified.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'
import type { ComponentType, SVGProps } from 'react'
import type { DeviceSyncStatus } from '@/data/deviceWorkingSet'
import type { SyncStatus } from '@/types'

export type StatusChipValue = SyncStatus | DeviceSyncStatus

const STATUS_CHIP_META: Record<
  StatusChipValue,
  {
    label: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    iconClassName: string
  }
> = {
  'on-quray': {
    label: 'On Quray',
    Icon: StatusOnIcon,
    iconClassName: 'text-status-positive',
  },
  modified: {
    label: 'Modified',
    Icon: StatusModifiedIcon,
    iconClassName: 'text-status-progress',
  },
  'not-synced': {
    label: 'Not synced',
    Icon: StatusNoneIcon,
    iconClassName: 'text-status-neutral',
  },
  current: {
    label: 'On device',
    Icon: StatusOnIcon,
    iconClassName: 'text-status-positive',
  },
  'needs-sync': {
    label: 'Needs sync',
    Icon: StatusModifiedIcon,
    iconClassName: 'text-status-progress',
  },
}

export function statusChipClassName() {
  return 'inline-flex items-center justify-center rounded-sm bg-bg-chip px-2 py-1.5'
}

export function getSyncStatusLabel(status: StatusChipValue) {
  return STATUS_CHIP_META[status].label
}

const PRESET_SYNC_STATUS_META: Record<
  SyncStatus,
  {
    label: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    iconClassName: string
  }
> = {
  'on-quray': {
    label: 'On device',
    Icon: StatusOnIcon,
    iconClassName: 'text-status-positive',
  },
  modified: {
    label: 'Needs sync',
    Icon: StatusModifiedIcon,
    iconClassName: 'text-status-progress',
  },
  'not-synced': {
    label: 'Not on device',
    Icon: StatusNoneIcon,
    iconClassName: 'text-status-neutral',
  },
}

export function getPresetSyncStatusMeta(status: SyncStatus) {
  return PRESET_SYNC_STATUS_META[status]
}

export function StatusChip({ status }: { status: StatusChipValue }) {
  const meta = STATUS_CHIP_META[status]
  const Icon = meta.Icon

  return (
    <span className={statusChipClassName()}>
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${meta.iconClassName}`}
        aria-hidden="true"
      />
    </span>
  )
}

export { STATUS_CHIP_META as SYNC_STATUS_META }
