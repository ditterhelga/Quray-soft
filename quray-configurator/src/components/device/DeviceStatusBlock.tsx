import {
  deviceCapacityFillClassName,
  deviceCapacityTrackClassName,
} from '@/components/device/deviceLayout'

type DeviceStatus = {
  usedMb: number
  totalMb: number
  firmwareVersion: string
}

type DeviceStatusBlockProps = {
  status: DeviceStatus
}

export function DeviceStatusBlock({ status }: DeviceStatusBlockProps) {
  const fillPercent = (status.usedMb / status.totalMb) * 100
  const capacityLabel = `${status.usedMb} MB / ${status.totalMb} MB used`

  return (
    <div className="px-8">
      <p className="mb-6 mt-1 text-sm font-light text-text-secondary">
        Presets and sets stored on your device
      </p>
      <div className="flex items-center gap-8">
        <div className="flex min-w-[14rem] flex-1 items-center gap-3">
          <div className={deviceCapacityTrackClassName()} aria-hidden="true">
            <div
              className={deviceCapacityFillClassName(fillPercent)}
              style={{ width: `${Math.min(fillPercent, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-light text-text-muted">{capacityLabel}</span>
        </div>
        <span className="shrink-0 text-xs font-light text-text-muted">
          v{status.firmwareVersion}
        </span>
      </div>
    </div>
  )
}
