import { ArrowSquareOut, CaretRight, DotsSixVertical, Plus } from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { SetKebabMenu } from '@/components/library/SetKebabMenu'
import {
  presetNameClassName,
  presetNameInputClassName,
  presetRelativeTimeClassName,
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowClassName,
  presetRowSecondaryActionsClassName,
} from '@/components/library/PresetRow'
import { StatusChip, getSyncStatusLabel } from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { setSyncStatusToChipStatus } from '@/utils/setActions'
import type { Preset, Set as LibrarySet, SyncStatus } from '@/types'

const SYNC_STATUS_DOT_COLOR: Record<SyncStatus, string> = {
  'on-quray': 'bg-status-positive',
  modified: 'bg-status-progress',
  'not-synced': 'bg-status-neutral',
}

export function setRowSubtitleClassName() {
  return 'mt-1 text-sm font-light text-text-muted'
}

export function setRowSlotPositionClassName() {
  return 'w-8 shrink-0 font-mono text-sm font-light tabular-nums text-text-muted'
}

export function setRowSlotListClassName() {
  return 'mt-4 border-t border-border pt-4'
}

export function setRowSlotRowClassName() {
  return 'flex items-center gap-3 py-2'
}

export function setRowAddPresetClassName() {
  return 'mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-light text-accent transition-colors duration-[120ms] hover:text-text-primary'
}

function SyncStatusDot({ status }: { status: SyncStatus }) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${SYNC_STATUS_DOT_COLOR[status]}`}
      aria-hidden="true"
    />
  )
}

function SetNameEditor({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string
  onSave: (name: string) => void
  onCancel: () => void
}) {
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
      aria-label="Set name"
    />
  )
}

type SetRowProps = {
  set: LibrarySet
  presetsById: Map<string, Preset>
  isExpanded: boolean
  onToggleExpand: () => void
  isRenaming?: boolean
  onRenameSave?: (name: string) => void
  onRenameCancel?: () => void
  onSetAction?: (actionId: string, setId: string) => void
  forceHover?: boolean
  forceKebabOpen?: boolean
}

export function SetRow({
  set,
  presetsById,
  isExpanded,
  onToggleExpand,
  isRenaming = false,
  onRenameSave,
  onRenameCancel,
  onSetAction,
  forceHover = false,
  forceKebabOpen = false,
}: SetRowProps) {
  const chipStatus = setSyncStatusToChipStatus(set.syncStatus)
  const statusLabel = getSyncStatusLabel(chipStatus)
  const presetCount = set.presetIds.length

  function handleRowClick() {
    if (isRenaming) {
      return
    }

    onToggleExpand()
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isRenaming) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleExpand()
    }
  }

  function handleOpenInEditor(event: MouseEvent) {
    event.stopPropagation()
    onSetAction?.('open-editor', set.id)
  }

  function handleSetAction(actionId: string, setId: string) {
    onSetAction?.(actionId, setId)
  }

  return (
    <article
      className={presetRowClassName(forceHover, isRenaming)}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      role={isRenaming ? undefined : 'button'}
      tabIndex={isRenaming ? -1 : 0}
      aria-expanded={isRenaming ? undefined : isExpanded}
      aria-label={
        isRenaming ? undefined : `${isExpanded ? 'Collapse' : 'Expand'} set ${set.name}`
      }
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CaretRight
            size={16}
            weight="regular"
            className={`mt-1 shrink-0 text-text-muted transition-transform duration-[120ms] ${
              isExpanded ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <SetNameEditor
                initialName={set.name}
                onSave={(name) => onRenameSave?.(name)}
                onCancel={() => onRenameCancel?.()}
              />
            ) : (
              <p className={presetNameClassName(forceHover)}>{set.name}</p>
            )}
            <p className={setRowSubtitleClassName()}>
              {presetCount} preset{presetCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Tooltip content={statusLabel} className="relative inline-flex shrink-0">
            <span aria-label={statusLabel}>
              <StatusChip status={chipStatus} />
            </span>
          </Tooltip>

          <div className={presetRelativeTimeClassName()}>
            {formatRelativeTime(set.lastUpdated.toISOString().slice(0, 10))}
          </div>

          <div className={presetRowSecondaryActionsClassName(forceHover)}>
            <Tooltip content="Open set editor" className={presetRowActionTooltipClassName}>
              <button
                type="button"
                onClick={handleOpenInEditor}
                className={presetRowActionButtonClassName()}
                aria-label="Open set editor"
              >
                <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
              </button>
            </Tooltip>
            <SetKebabMenu
              setId={set.id}
              forceOpen={forceKebabOpen}
              onItemSelect={handleSetAction}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={setRowSlotListClassName()} onClick={(event) => event.stopPropagation()}>
          {set.presetIds.map((presetId, index) => {
            const preset = presetsById.get(presetId)

            return (
              <div key={`${set.id}-${presetId}`} className={setRowSlotRowClassName()}>
                <span className={setRowSlotPositionClassName()}>#{index + 1}</span>
                <DotsSixVertical
                  size={16}
                  weight="regular"
                  className="shrink-0 text-text-muted"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-light text-text-primary">
                  {preset?.name ?? 'Unknown preset'}
                </span>
                <SyncStatusDot status={preset?.syncStatus ?? 'not-synced'} />
              </div>
            )
          })}
          <button type="button" className={setRowAddPresetClassName()}>
            <Plus size={14} weight="regular" aria-hidden="true" />
            Add preset
          </button>
        </div>
      )}
    </article>
  )
}
