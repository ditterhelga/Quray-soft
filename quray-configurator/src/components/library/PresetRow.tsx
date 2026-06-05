import { ArrowSquareOut, Star } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
  PRESET_TABLE_ACTIONS_CELL,
  PRESET_TABLE_GRID,
  PRESET_TABLE_GRID_EXPLORE,
  PRESET_TABLE_STATUS_CELL,
} from '@/components/library/presetTableLayout'
import { PresetKebabMenu } from '@/components/library/PresetKebabMenu'
import {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
} from '@/components/library/presetRowActions'
import { formatOutputLabel, OutputChip, ZoneBadge } from '@/components/ui/Badge'
import {
  presetRowCheckboxVisibilityClassName,
  presetRowNameColumnClassName,
} from '@/components/library/presetRowSelection'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import type { Preset } from '@/types'

export function presetRowClassName(forceHover = false, isRenaming = false) {
  return `group rounded-lg border border-border bg-bg-active p-6 transition-colors duration-[120ms] ${
    isRenaming ? '' : 'cursor-pointer hover:bg-bg-row-hover'
  } ${forceHover && !isRenaming ? 'bg-bg-row-hover' : ''}`
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

function StatusChipCell({ status }: { status: Preset['syncStatus'] }) {
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
      <DeviceNames devices={preset.targetDevices} />
    )

  if (!bulkSelectionEnabled) {
    return (
      <>
        {nameBlock}
        {subLine}
      </>
    )
  }

  return (
    <div className="relative min-w-0">
      <SelectionCheckbox
        checked={isSelected}
        onToggle={onToggleSelect}
        ariaLabel={
          isSelected ? `Deselect ${preset.name}` : `Select ${preset.name}`
        }
        className={`absolute left-0 top-[0.5625rem] z-10 -translate-y-1/2 ${presetRowCheckboxVisibilityClassName(bulkActive)}`}
      />
      <div className={presetRowNameColumnClassName(bulkActive)}>
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
  forceHover?: boolean
  forceKebabOpen?: boolean
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
  forceHover = false,
  forceKebabOpen = false,
}: PresetRowProps) {
  function handleRowClick() {
    if (isRenaming) {
      return
    }

    if (onRowClick) {
      onRowClick()
      return
    }

    console.log('Open preset', preset.id)
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isRenaming) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRowClick()
    }
  }

  function handleOpenInEditor(event: MouseEvent) {
    event.stopPropagation()
    console.log('Open in editor', preset.id)
  }

  function handlePresetAction(actionId: string, presetId: string) {
    onPresetAction?.(actionId, presetId)
  }

  const favouriteTooltip = isFavourite ? 'Remove from favourites' : 'Add to favourites'
  const rowAriaLabel =
    variant === 'explore'
      ? `Add ${preset.name} to My Library`
      : `Open preset ${preset.name}`

  return (
    <article
      className={presetRowClassName(forceHover, isRenaming)}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      role={isRenaming ? undefined : 'button'}
      tabIndex={isRenaming ? -1 : 0}
      aria-label={isRenaming ? undefined : rowAriaLabel}
    >
      <div className={variant === 'explore' ? PRESET_TABLE_GRID_EXPLORE : PRESET_TABLE_GRID}>
        <div className="min-w-0">
          <PresetNameColumn
            preset={preset}
            forceHover={forceHover}
            isRenaming={isRenaming}
            variant={variant}
            bulkSelectionEnabled={bulkSelectionEnabled}
            bulkActive={bulkActive}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            onRenameSave={onRenameSave}
            onRenameCancel={onRenameCancel}
          />
        </div>

        {variant === 'library' && (
          <div className={PRESET_TABLE_STATUS_CELL}>
            <StatusChipCell status={preset.syncStatus} />
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {preset.outputTypes.map((outputType) => (
            <OutputChip key={outputType} label={formatOutputLabel(outputType)} />
          ))}
        </div>

        <div>
          <ZoneBadge count={preset.zoneCount} />
        </div>

        <div className={presetRelativeTimeClassName()}>
          {formatRelativeTime(preset.lastUpdated)}
        </div>

        <div className={PRESET_TABLE_ACTIONS_CELL}>
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
          <div className={presetRowSecondaryActionsClassName(forceHover)}>
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
              variant={variant}
              forceOpen={forceKebabOpen}
              onItemSelect={handlePresetAction}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export { SYNC_STATUS_META } from '@/components/ui/StatusChip'
