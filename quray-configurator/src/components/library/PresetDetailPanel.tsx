import {
  CopySimple,
  Export,
  FolderPlus,
  PencilSimple,
  Trash,
  X,
} from '@phosphor-icons/react'
import { FanVisualization } from '@/components/library/FanVisualization'
import { PresetDetailPanelBody } from '@/components/library/PresetDetailPanelBody'
import {
  presetDetailPanelClassName,
  presetDetailPanelCloseButtonClassName,
  presetDetailPanelFooterClassName,
  presetDetailPanelFooterDeleteButtonClassName,
  presetDetailPanelFooterDividerClassName,
  presetDetailPanelFooterIconActionsClassName,
  presetDetailPanelFooterIconButtonClassName,
  presetDetailPanelFooterIconDividerClassName,
  presetDetailPanelFooterIconGroupClassName,
  presetDetailPanelFooterPrimaryActionsClassName,
  presetDetailPanelSendToQurayButtonClassName,
} from '@/components/library/presetDetailPanelLayout'
import { presetRowActionTooltipClassName } from '@/components/library/presetRowActions'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Preset, Set as LibrarySet } from '@/types'

type PresetDetailPanelVariant = 'library' | 'explore'

type PresetDetailPanelProps = {
  variant?: PresetDetailPanelVariant
  preset: Preset
  memberSets?: LibrarySet[]
  isFavourite: boolean
  onToggleFavourite: () => void
  onClose: () => void
  onOpenInEditor?: () => void
  onAddToLibrary?: () => void
  onSendToQuray?: () => void
  onNavigateToSet?: (setId: string) => void
  onDuplicate?: () => void
  onRename?: () => void
  onAddToSet?: () => void
  onExport?: () => void
  onDelete?: () => void
}

const LIBRARY_SECONDARY_ACTIONS = [
  { id: 'duplicate', label: 'Duplicate', icon: CopySimple },
  { id: 'rename', label: 'Rename', icon: PencilSimple },
  { id: 'add-to-set', label: 'Add to set', icon: FolderPlus },
  { id: 'export', label: 'Export', icon: Export },
] as const

export function PresetDetailPanel({
  variant = 'library',
  preset,
  memberSets = [],
  isFavourite,
  onToggleFavourite,
  onClose,
  onOpenInEditor,
  onAddToLibrary,
  onSendToQuray,
  onNavigateToSet,
  onDuplicate,
  onRename,
  onAddToSet,
  onExport,
  onDelete,
}: PresetDetailPanelProps) {
  const isExplore = variant === 'explore'

  function handleSecondaryAction(
    id: (typeof LIBRARY_SECONDARY_ACTIONS)[number]['id'],
  ) {
    if (id === 'duplicate') {
      onDuplicate?.()
      return
    }

    if (id === 'rename') {
      onRename?.()
      return
    }

    if (id === 'add-to-set') {
      onAddToSet?.()
      return
    }

    onExport?.()
  }

  return (
    <aside
      className={presetDetailPanelClassName()}
      role="complementary"
      aria-label={`${preset.name} details`}
    >
      <Tooltip content="Close" className={presetRowActionTooltipClassName}>
        <button
          type="button"
          onClick={onClose}
          className={presetDetailPanelCloseButtonClassName()}
          aria-label="Close preset details"
        >
          <X size={18} weight="regular" aria-hidden="true" />
        </button>
      </Tooltip>

      <FanVisualization zones={preset.zones} presetId={preset.id} />

      <PresetDetailPanelBody
        variant={variant}
        preset={preset}
        memberSets={memberSets}
        isFavourite={isFavourite}
        onToggleFavourite={onToggleFavourite}
        onNavigateToSet={onNavigateToSet ?? (() => undefined)}
      />

      <footer className={presetDetailPanelFooterClassName()}>
        <div className={presetDetailPanelFooterPrimaryActionsClassName()}>
          {isExplore ? (
            <Button type="button" onClick={onAddToLibrary} className="w-full justify-center">
              Add to library
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={onOpenInEditor}
                className="w-full justify-center"
              >
                Open in editor
              </Button>
              <button
                type="button"
                onClick={onSendToQuray}
                className={presetDetailPanelSendToQurayButtonClassName()}
              >
                Send to Quray
              </button>
            </>
          )}
        </div>

        {!isExplore && (
          <>
            <div className={presetDetailPanelFooterDividerClassName()} aria-hidden="true" />

            <div className={presetDetailPanelFooterIconActionsClassName()}>
              <div className={presetDetailPanelFooterIconGroupClassName()}>
                {LIBRARY_SECONDARY_ACTIONS.map(({ id, label, icon: Icon }) => (
                  <Tooltip key={id} content={label} className={presetRowActionTooltipClassName}>
                    <button
                      type="button"
                      onClick={() => handleSecondaryAction(id)}
                      className={presetDetailPanelFooterIconButtonClassName()}
                      aria-label={label}
                    >
                      <Icon size={20} weight="regular" aria-hidden="true" />
                    </button>
                  </Tooltip>
                ))}
              </div>
              <div className={presetDetailPanelFooterIconDividerClassName()} aria-hidden="true" />
              <Tooltip content="Delete" className={presetRowActionTooltipClassName}>
                <button
                  type="button"
                  onClick={onDelete}
                  className={presetDetailPanelFooterDeleteButtonClassName()}
                  aria-label="Delete"
                >
                  <Trash size={20} weight="regular" aria-hidden="true" />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </footer>
    </aside>
  )
}
