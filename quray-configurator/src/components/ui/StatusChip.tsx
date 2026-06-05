import StatusModifiedIcon from '@/assets/icons/status-modified.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'
import type { ComponentType, SVGProps } from 'react'
import type { SyncStatus } from '@/types'

const STATUS_CHIP_META: Record<
  SyncStatus,
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
}

export function statusChipClassName() {
  return 'inline-flex items-center justify-center rounded-sm bg-bg-chip px-2 py-1.5'
}

export function getSyncStatusLabel(status: SyncStatus) {
  return STATUS_CHIP_META[status].label
}

export function StatusChip({ status }: { status: SyncStatus }) {
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
