import {
  libraryToolbarActionsClassName,
  libraryToolbarClassName,
  libraryToolbarRowClassName,
} from '@/components/library/LibraryToolbar'
import { tabGroupClassName } from '@/components/ui/Tab'
import { ArrowClockwise } from '@phosphor-icons/react'
import {
  deviceStagedChangesClassName,
  deviceToolbarTitleClassName,
  deviceUpdateButtonClassName,
  formatDeviceStagedChangesLabel,
} from '@/components/device/deviceLayout'
import { Tooltip } from '@/components/ui/Tooltip'

type DeviceToolbarProps = {
  hasStagedChanges: boolean
  arrangementChangeCount: number
  updateCount: number
  onUpdateQuray: () => void
}

export function DeviceToolbar({
  hasStagedChanges,
  arrangementChangeCount,
  updateCount,
  onUpdateQuray,
}: DeviceToolbarProps) {
  const stagedChangesLabel = formatDeviceStagedChangesLabel(
    arrangementChangeCount,
    updateCount,
  )

  return (
    <div className={libraryToolbarClassName()}>
      <div className={libraryToolbarRowClassName()}>
        <nav className={tabGroupClassName()} aria-label="Device view">
          <h1 className={deviceToolbarTitleClassName()}>My Quray</h1>
        </nav>

        <div className={libraryToolbarActionsClassName()}>
          {stagedChangesLabel && (
            <span className={deviceStagedChangesClassName()}>{stagedChangesLabel}</span>
          )}
          <Tooltip content="Applies your arrangement and updates modified presets on the device.">
            <span className="inline-flex">
              <button
                type="button"
                disabled={!hasStagedChanges}
                onClick={onUpdateQuray}
                className={deviceUpdateButtonClassName()}
              >
                <ArrowClockwise size={16} weight="regular" className="shrink-0" aria-hidden="true" />
                Sync to Quray
              </button>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
