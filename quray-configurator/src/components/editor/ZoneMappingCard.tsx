import { CaretRight, Trash } from '@phosphor-icons/react'
import { useMemo, useRef } from 'react'
import {
  createDefaultMapping,
  CV_MODE_OPTIONS,
  MAPPING_TYPE_OPTIONS,
  mappingSummary,
  ROOT_NOTES,
  type ZoneAxis,
  type ZoneMapping,
  type ZoneMappingType,
} from '@/components/editor/zoneMappings'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { StepperInput } from '@/components/ui/StepperInput'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { buildScaleNotes, distributeNotes, NOTE_NAMES, SCALES } from '@/utils/scales'

const CHANNEL_OPTIONS = Array.from({ length: 16 }, (_, index) => String(index + 1))
const GATE_CHANNEL_OPTIONS = ['1', '2', '3', '4']

export function zoneFieldCardClassName() {
  return 'flex h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-active px-3'
}

function zoneFieldLabelClassName() {
  return 'shrink-0 text-sm font-light text-text-muted'
}

function ZoneFieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const selectRef = useRef<HTMLSelectElement>(null)

  return (
    <label
      className={zoneFieldCardClassName()}
      onClick={() => selectRef.current?.click()}
    >
      <span className={zoneFieldLabelClassName()}>{label}</span>
      <select
        ref={selectRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ZoneNumericField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className={zoneFieldCardClassName()}>
      <span className={zoneFieldLabelClassName()}>{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (!Number.isNaN(next)) {
              onChange(Math.max(min, Math.min(max, next)))
            }
          }}
          className="w-16 bg-transparent text-right text-sm font-light text-text-primary outline-none"
        />
        {suffix && <span className="text-sm font-light text-text-muted">{suffix}</span>}
      </div>
    </label>
  )
}

export interface ZoneMappingCardProps {
  mapping: ZoneMapping
  isOpen: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<ZoneMapping>) => void
  onTypeChange: (type: ZoneMappingType) => void
  onDelete: () => void
  /** Preset-level scale name — defaults to 'Chromatic' until wired from context. */
  presetScale?: string
  /** Preset-level root note — defaults to 'C' until wired from context. */
  presetRoot?: string
  onApplySplit?: () => void
}

export function ZoneMappingCard({
  mapping,
  isOpen,
  onToggle,
  onUpdate,
  onTypeChange,
  onDelete,
  presetScale = 'Chromatic',
  presetRoot = 'C',
  onApplySplit,
}: ZoneMappingCardProps) {
  const split = mapping.split ?? {
    enabled: false,
    mode: 'Linear' as const,
    steps: 6,
    xDivisions: 2,
    yDivisions: 2,
  }

  const rootNoteOptions = useMemo(() => {
    if (presetScale === 'Chromatic' || !SCALES[presetScale]) {
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    }
    const rootIdx = NOTE_NAMES.indexOf(presetRoot)
    const intervals = SCALES[presetScale]
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
    return intervals.map((semitone, i) => {
      const noteIdx = (rootIdx + semitone) % 12
      return `${romanNumerals[i] ?? String(i + 1)} (${NOTE_NAMES[noteIdx]})`
    })
  }, [presetScale, presetRoot])

  const noteCount = (split.xDivisions ?? 2) * (split.yDivisions ?? 2)

  const splitNotes = useMemo(() => {
    if (!split.enabled) return []
    const pool = buildScaleNotes(presetScale, presetRoot, mapping.octave ?? 4, noteCount * 3)
    return distributeNotes(pool, split.mode, noteCount)
  }, [split.enabled, split.mode, split.xDivisions, split.yDivisions, presetScale, presetRoot, mapping.octave, noteCount])

  return (
    <div className="overflow-hidden rounded-xl border border-border-active bg-bg-active">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          <CaretRight
            size={14}
            weight="regular"
            className={`shrink-0 text-text-muted transition-transform duration-[120ms] ${
              isOpen ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
          <span className="truncate text-sm font-light text-text-primary">
            {mappingSummary(mapping)}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete mapping"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover hover:text-status-error"
        >
          <Trash size={16} weight="regular" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-border-subtle px-3 pb-4 pt-3">
          <div
            className="flex h-11 items-center gap-1 rounded-lg border border-border-subtle bg-bg-active p-1"
            role="tablist"
            aria-label="Mapping type"
          >
            {MAPPING_TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={mapping.type === option}
                onClick={() => onTypeChange(option)}
                className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md text-xs font-light transition-colors duration-[120ms] ${
                  mapping.type === option
                    ? 'bg-accent text-text-primary'
                    : 'bg-transparent text-text-muted hover:bg-bg-hover'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {mapping.type !== 'Note' && (
            <ZoneFieldSelect
              label="Channel"
              value={String(mapping.channel)}
              options={CHANNEL_OPTIONS}
              onChange={(channel) => onUpdate({ channel: Number(channel) })}
            />
          )}

          {mapping.type === 'Note' && (
            <>
              <ZoneFieldSelect
                label="Channel"
                value={String(mapping.channel)}
                options={CHANNEL_OPTIONS}
                onChange={(channel) => onUpdate({ channel: Number(channel) })}
              />
              <ZoneFieldSelect
                label="Root note"
                value={mapping.rootNote ?? rootNoteOptions[0]}
                options={rootNoteOptions}
                onChange={(rootNote) => onUpdate({ rootNote })}
              />
              <ZoneFieldSelect
                label="Octave"
                value={String(mapping.octave ?? 4)}
                options={['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
                onChange={(v) => onUpdate({ octave: Number(v) })}
              />

              {/* SPLIT ZONE header row — plain, no card border */}
              <div className="flex items-center justify-between px-1 pb-0 pt-3">
                <span className="text-xs uppercase tracking-wide text-text-muted">Split Zone</span>
                <ToggleSwitch
                  checked={split.enabled}
                  onChange={(enabled) =>
                    onUpdate({ split: { ...split, enabled } })
                  }
                />
              </div>

              {split.enabled && (
                <div className="flex flex-col gap-3 mt-1.5">
                  {/* Distribution tabs — same style as the type selector */}
                  <div
                    className="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-active p-1"
                    role="tablist"
                    aria-label="Split distribution"
                  >
                    {(['Linear', 'Jump 2', 'Jump 3', 'Random'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="tab"
                        aria-selected={split.mode === mode}
                        onClick={() => onUpdate({ split: { ...split, mode } })}
                        className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md text-xs font-light transition-colors duration-[120ms] ${
                          split.mode === mode
                            ? 'bg-accent text-text-primary'
                            : 'bg-transparent text-text-muted hover:bg-bg-hover'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* X / Y divisions in a grid row */}
                  <div className="grid grid-cols-2 gap-3">
                    <ZoneFieldSelect
                      label="X"
                      value={String(split.xDivisions)}
                      options={['1', '2', '3', '4', '5', '6', '7', '8']}
                      onChange={(v) =>
                        onUpdate({ split: { ...split, xDivisions: Number(v) } })
                      }
                    />
                    <ZoneFieldSelect
                      label="Y"
                      value={String(split.yDivisions)}
                      options={['1', '2', '3', '4', '5', '6', '7', '8']}
                      onChange={(v) =>
                        onUpdate({ split: { ...split, yDivisions: Number(v) } })
                      }
                    />
                  </div>

                  {/* Note preview pills */}
                  <div
                    className="flex flex-wrap gap-1 rounded-xl border border-border-subtle bg-bg-active px-3 py-2.5"
                    aria-label="Note distribution preview"
                  >
                    {splitNotes.map((note, index) => (
                      <span
                        key={`${note}-${index}`}
                        className="rounded bg-bg-hover px-2 py-1 text-xs font-light text-text-secondary"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {onApplySplit && (
                    <button
                      type="button"
                      onClick={onApplySplit}
                      className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-transparent text-sm font-light text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary"
                    >
                      Apply split
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {mapping.type === 'CC' && (
            <>
              <ZoneNumericField
                label="CC number"
                value={mapping.cc ?? 0}
                min={0}
                max={127}
                onChange={(cc) => onUpdate({ cc })}
              />
              <SegmentedControl
                value={mapping.axis}
                options={[
                  { value: 'Y', label: 'Y' },
                  { value: 'X', label: 'X' },
                  { value: 'Entry', label: 'Entry' },
                  { value: 'Exit', label: 'Exit' },
                ]}
                onChange={(axis) => onUpdate({ axis: axis as ZoneAxis })}
                ariaLabel="CC axis"
              />
              <ToggleSwitch
                label="Single value"
                checked={mapping.singleValue ?? false}
                onChange={(singleValue) => onUpdate({ singleValue })}
              />
              {mapping.singleValue ? (
                <ZoneNumericField
                  label="Value"
                  value={mapping.bottom ?? 0}
                  min={0}
                  max={127}
                  onChange={(bottom) => onUpdate({ bottom })}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ZoneNumericField
                    label="Bottom"
                    value={mapping.bottom ?? 0}
                    min={0}
                    max={127}
                    onChange={(bottom) => onUpdate({ bottom })}
                  />
                  <ZoneNumericField
                    label="Top"
                    value={mapping.top ?? 127}
                    min={0}
                    max={127}
                    onChange={(top) => onUpdate({ top })}
                  />
                </div>
              )}
            </>
          )}

          {mapping.type === 'CV' && (
            <>
              <SegmentedControl
                value={String(mapping.port ?? 1)}
                options={[
                  { value: '1', label: 'CV1' },
                  { value: '2', label: 'CV2' },
                  { value: '3', label: 'CV3' },
                  { value: '4', label: 'CV4' },
                ]}
                onChange={(port) => onUpdate({ port: Number(port) })}
                ariaLabel="CV port"
              />
              <ZoneFieldSelect
                label="Mode"
                value={mapping.cvMode ?? 'Pitch'}
                options={CV_MODE_OPTIONS.map((option) => option.label)}
                onChange={(label) => {
                  const match = CV_MODE_OPTIONS.find((option) => option.label === label)
                  if (match) {
                    onUpdate({ cvMode: match.value })
                  }
                }}
              />
              <SegmentedControl
                value={mapping.axis}
                options={[
                  { value: 'Y', label: 'Y' },
                  { value: 'X', label: 'X' },
                  { value: 'Entry', label: 'Entry' },
                  { value: 'Exit', label: 'Exit' },
                ]}
                onChange={(axis) => onUpdate({ axis: axis as ZoneAxis })}
                ariaLabel="CV axis"
              />
              <ToggleSwitch
                label="Single value"
                checked={mapping.singleValue ?? false}
                onChange={(singleValue) => onUpdate({ singleValue })}
              />
              {mapping.singleValue ? (
                <ZoneNumericField
                  label="Value"
                  value={mapping.bottom ?? 0}
                  min={-5}
                  max={5}
                  step={0.1}
                  suffix="V"
                  onChange={(bottom) => onUpdate({ bottom })}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ZoneNumericField
                    label="Bottom"
                    value={mapping.bottom ?? -5}
                    min={-5}
                    max={5}
                    step={0.1}
                    suffix="V"
                    onChange={(bottom) => onUpdate({ bottom })}
                  />
                  <ZoneNumericField
                    label="Top"
                    value={mapping.top ?? 5}
                    min={-5}
                    max={5}
                    step={0.1}
                    suffix="V"
                    onChange={(top) => onUpdate({ top })}
                  />
                </div>
              )}
            </>
          )}

          {mapping.type === 'CV note' && (
            <>
              <ZoneFieldSelect
                label="Root note"
                value={mapping.rootNote ?? 'C'}
                options={[...ROOT_NOTES]}
                onChange={(rootNote) => onUpdate({ rootNote })}
              />
              <div className={zoneFieldCardClassName()}>
                <span className={zoneFieldLabelClassName()}>Octave</span>
                <StepperInput
                  value={mapping.octave ?? 4}
                  min={0}
                  max={8}
                  onChange={(octave) => onUpdate({ octave })}
                />
              </div>
              <SegmentedControl
                value={String(mapping.port ?? 1)}
                options={[
                  { value: '1', label: 'CV1' },
                  { value: '2', label: 'CV2' },
                  { value: '3', label: 'CV3' },
                  { value: '4', label: 'CV4' },
                ]}
                onChange={(port) => onUpdate({ port: Number(port) })}
                ariaLabel="CV note port"
              />
              <ZoneFieldSelect
                label="Gate channel"
                value={String(mapping.gateChannel ?? 1)}
                options={GATE_CHANNEL_OPTIONS}
                onChange={(gateChannel) =>
                  onUpdate({ gateChannel: Number(gateChannel) })
                }
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** Standalone demo mapping for the styleguide. */
export function createStyleguideMapping(overrides: Partial<ZoneMapping> = {}): ZoneMapping {
  const type = overrides.type ?? 'CC'
  return { ...createDefaultMapping(type), ...overrides, type }
}
