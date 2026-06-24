import {
  libraryToolbarActionsClassName,
  libraryToolbarClassName,
  libraryToolbarRowClassName,
} from '@/components/library/LibraryToolbar'
import { tabGroupClassName } from '@/components/ui/Tab'
import { ArrowClockwise, GearSix } from '@phosphor-icons/react'
import {
  deviceStagedChangesListClassName,
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
  onOpenSettings: () => void
}

export function DeviceToolbar({
  hasStagedChanges,
  arrangementChangeCount,
  updateCount,
  onUpdateQuray,
  onOpenSettings,
}: DeviceToolbarProps) {
  const stagedChangesParts = formatDeviceStagedChangesLabel(
    arrangementChangeCount,
    updateCount,
  )

  return (
    <div className={libraryToolbarClassName()}>
      <div className={libraryToolbarRowClassName()}>
        <nav className={tabGroupClassName()} aria-label="Device view">
          <div className="flex items-baseline gap-2">
            <h1 className={deviceToolbarTitleClassName()}>My Quray</h1>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary"
              aria-label="Device settings"
            >
              <GearSix size={16} weight="regular" aria-hidden="true" />
            </button>
          </div>
        </nav>

        <div className={libraryToolbarActionsClassName()}>
          {stagedChangesParts.length > 0 && (
            <span className={deviceStagedChangesListClassName()}>
              {stagedChangesParts.map((part, index) =>
                index === 0 ? (
                  <span key={part}>{part}</span>
                ) : (
                  <span key={part} className="inline-flex items-center gap-x-4">
                    <span aria-hidden="true">·</span>
                    <span>{part}</span>
                  </span>
                ),
              )}
            </span>
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
