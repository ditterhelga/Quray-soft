import {
  deviceCapacityFillClassName,
  deviceCapacityTrackClassName,
  deviceStatusBlockClassName,
  deviceStatusCapacityClassName,
  deviceStatusItemClassName,
  deviceStatusLabelClassName,
  deviceStatusRowClassName,
  deviceStatusValueClassName,
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
    <div className={deviceStatusBlockClassName()}>
      <div className={deviceStatusRowClassName()}>
        <div className={`${deviceStatusItemClassName()} ${deviceStatusCapacityClassName()}`}>
          <span className={deviceStatusLabelClassName()}>Capacity</span>
          <span className={deviceStatusValueClassName()}>{capacityLabel}</span>
          <div className={deviceCapacityTrackClassName()} aria-hidden="true">
            <div
              className={deviceCapacityFillClassName(fillPercent)}
              style={{ width: `${Math.min(fillPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className={deviceStatusItemClassName()}>
          <span className={deviceStatusLabelClassName()}>Firmware</span>
          <span className={deviceStatusValueClassName()}>
            Firmware {status.firmwareVersion}
          </span>
        </div>
      </div>
    </div>
  )
}
