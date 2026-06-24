import { useState } from 'react'
import { ArrowSquareOut, CaretDown, Star } from '@phosphor-icons/react'
import {
  presetDetailPanelAccordionCaretClassName,
  presetDetailPanelAccordionHeaderClassName,
  presetDetailPanelBodyClassName,
  presetDetailPanelEmptyStateClassName,
  presetDetailPanelMetadataGridClassName,
  presetDetailPanelMetadataLabelClassName,
  presetDetailPanelMetadataValueClassName,
  presetDetailPanelNameRowClassName,
  presetDetailPanelSectionClassName,
  presetDetailPanelSectionHeaderClassName,
  presetDetailPanelSetRowClassName,
  presetDetailPanelSetRowLabelClassName,
  presetDetailPanelStatusValueClassName,
  presetDetailPanelTitleClassName,
  presetDetailPanelZoneDotClassName,
  presetDetailPanelZoneMetaClassName,
  presetDetailPanelZoneNameClassName,
  presetDetailPanelZoneRowClassName,
} from '@/components/library/presetDetailPanelLayout'
import {
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
} from '@/components/library/presetRowActions'
import { CompactOutputChip, formatOutputLabel } from '@/components/ui/Badge'
import { getPresetSyncStatusMeta } from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import type { Preset, Set as LibrarySet } from '@/types'

type PresetDetailPanelVariant = 'library' | 'explore'

type PresetDetailPanelBodyProps = {
  variant?: PresetDetailPanelVariant
  preset: Preset
  memberSets: LibrarySet[]
  isFavourite: boolean
  onToggleFavourite: () => void
  onNavigateToSet: (setId: string) => void
}

export function PresetDetailPanelBody({
  variant = 'library',
  preset,
  memberSets,
  isFavourite,
  onToggleFavourite,
  onNavigateToSet,
}: PresetDetailPanelBodyProps) {
  const isExplore = variant === 'explore'
  const [zonesExpanded, setZonesExpanded] = useState(true)
  const zoneCount = preset.zones.length
  const statusMeta = getPresetSyncStatusMeta(preset.syncStatus)
  const StatusIcon = statusMeta.Icon
  const favouriteTooltip = isFavourite ? 'Remove from favourites' : 'Add to favourites'

  return (
    <div className={presetDetailPanelBodyClassName()}>
      <div className={presetDetailPanelNameRowClassName()}>
        <Tooltip content={favouriteTooltip} className={presetRowActionTooltipClassName}>
          <button
            type="button"
            onClick={onToggleFavourite}
            className={presetRowFavouriteButtonClassName()}
            aria-label={favouriteTooltip}
            aria-pressed={isFavourite}
          >
            <Star
              size={16}
              weight={isFavourite ? 'fill' : 'regular'}
              aria-hidden="true"
            />
          </button>
        </Tooltip>
        <h2 className={presetDetailPanelTitleClassName()}>{preset.name}</h2>
      </div>

      <section className={presetDetailPanelSectionClassName()}>
        <dl className={presetDetailPanelMetadataGridClassName()}>
          {!isExplore && (
            <>
              <dt className={presetDetailPanelMetadataLabelClassName()}>Status</dt>
              <dd className={presetDetailPanelMetadataValueClassName()}>
                <span className={presetDetailPanelStatusValueClassName()}>
                  <StatusIcon
                    className={`h-3.5 w-3.5 shrink-0 ${statusMeta.iconClassName}`}
                    aria-hidden="true"
                  />
                  {statusMeta.label}
                </span>
              </dd>
            </>
          )}
          <dt className={presetDetailPanelMetadataLabelClassName()}>Output</dt>
          <dd className={presetDetailPanelMetadataValueClassName()}>
            {preset.outputTypes.map(formatOutputLabel).join(' · ')}
          </dd>
          <dt className={presetDetailPanelMetadataLabelClassName()}>Zones</dt>
          <dd className={presetDetailPanelMetadataValueClassName()}>{zoneCount}</dd>
          {isExplore ? (
            <>
              <dt className={presetDetailPanelMetadataLabelClassName()}>Tags</dt>
              <dd className={presetDetailPanelMetadataValueClassName()}>
                {(preset.tags ?? []).join(' · ') || '—'}
              </dd>
            </>
          ) : (
            <>
              {preset.devices && preset.devices.length > 0 && (
                <>
                  <dt className={presetDetailPanelMetadataLabelClassName()}>Device</dt>
                  <dd className={presetDetailPanelMetadataValueClassName()}>
                    {preset.devices.join(', ')}
                  </dd>
                </>
              )}
            </>
          )}
          <dt className={presetDetailPanelMetadataLabelClassName()}>Updated</dt>
          <dd className={presetDetailPanelMetadataValueClassName()}>
            {formatRelativeTime(preset.lastUpdated)}
          </dd>
        </dl>
      </section>

      {!isExplore && (
        <section className={presetDetailPanelSectionClassName()}>
          <h3 className={presetDetailPanelSectionHeaderClassName()}>
            In sets · {memberSets.length}
          </h3>
          <div className="mt-4">
            {memberSets.length === 0 ? (
              <p className={presetDetailPanelEmptyStateClassName()}>Not in any set</p>
            ) : (
              memberSets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onNavigateToSet(set.id)}
                  className={presetDetailPanelSetRowClassName()}
                >
                  <span className={presetDetailPanelSetRowLabelClassName()}>{set.name}</span>
                  <ArrowSquareOut
                    size={16}
                    weight="regular"
                    className="shrink-0 text-text-muted"
                    aria-hidden="true"
                  />
                </button>
              ))
            )}
          </div>
        </section>
      )}

      <section className={presetDetailPanelSectionClassName()}>
        <button
          type="button"
          onClick={() => setZonesExpanded((current) => !current)}
          className={presetDetailPanelAccordionHeaderClassName()}
          aria-expanded={zonesExpanded}
        >
          <span className={presetDetailPanelSectionHeaderClassName()}>
            Zones · {zoneCount}
          </span>
          <CaretDown
            size={16}
            weight="regular"
            className={presetDetailPanelAccordionCaretClassName(zonesExpanded)}
            aria-hidden="true"
          />
        </button>
        {zonesExpanded && (
          <div className="mt-4">
            {preset.zones.map((zone) => (
              <div key={zone.id} className={presetDetailPanelZoneRowClassName()}>
                <span
                  className={presetDetailPanelZoneDotClassName()}
                  style={{ backgroundColor: zone.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className={presetDetailPanelZoneNameClassName()}>{zone.name}</p>
                  <p className={presetDetailPanelZoneMetaClassName()}>
                    {zone.paramLabel} · {zone.axis}
                  </p>
                </div>
                <CompactOutputChip label={zone.outputType} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
