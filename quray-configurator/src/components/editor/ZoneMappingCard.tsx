import { CaretRight, Trash } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MIDI_DEVICES, findMidiDevice, findMidiParameter } from '@/components/editor/midiDevices'
import {
  createDefaultMapping,
  CV_MODE_OPTIONS,
  MAPPING_TYPE_OPTIONS,
  mappingSummary,
  ROOT_NOTES,
  type ZoneMapping,
  type ZoneMappingType,
} from '@/components/editor/zoneMappings'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { StepperInput } from '@/components/ui/StepperInput'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { buildScaleNotes, distributeNotes, NOTE_NAMES, SCALES } from '@/utils/scales'

const CHANNEL_OPTIONS = Array.from({ length: 16 }, (_, index) => String(index + 1))
const GATE_CHANNEL_OPTIONS = ['1', '2', '3', '4']
const cvRowClassName = 'flex h-11 items-center justify-between px-3'
const mappingSectionClassName = 'flex flex-col gap-2'
const mappingDividerClassName = 'my-2 border-t border-border-subtle'
const mappingCheckboxRowClassName = 'flex items-center justify-end px-3 py-1'
const mappingNumericBoxClassName =
  'inline-flex h-9 w-[4rem] shrink-0 items-center justify-end rounded-xl border border-border-subtle bg-bg-active pl-2 pr-3'
const mappingNumericInputClassName =
  'w-full bg-transparent text-right text-sm font-light text-text-primary tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

function mappingTabButtonClassName(active: boolean) {
  return `flex h-8 w-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-2px)] border text-xs font-light outline-none focus:outline-none focus-visible:outline-none ${
    active
      ? 'border-transparent bg-accent text-text-primary'
      : 'border-border-subtle bg-bg-active text-text-muted hover:bg-bg-hover'
  }`
}

export function zoneFieldCardClassName() {
  return 'flex h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-active px-3'
}

function zoneFieldLabelClassName() {
  return 'shrink-0 text-sm font-light text-text-muted'
}

const textNumericInputClassName =
  'min-w-0 flex-1 bg-transparent text-right text-sm font-light text-text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

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

function IntegerTextInput({
  value,
  min,
  max,
  onChange,
  className = textNumericInputClassName,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  className?: string
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    const clamped = Math.max(min, Math.min(max, parsed))
    setDraft(String(clamped))
    onChange(clamped)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
    if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault()
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => {
        const target = event.target
        setTimeout(() => {
          const len = target.value.length
          target.setSelectionRange(len, len)
        }, 0)
      }}
      onBlur={() => commit(draft)}
      onKeyDown={handleKeyDown}
      className={className}
    />
  )
}

function ZoneIntegerTextField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className={zoneFieldCardClassName()}>
      <span className={zoneFieldLabelClassName()}>{label}</span>
      <IntegerTextInput value={value} min={min} max={max} onChange={onChange} />
    </label>
  )
}

function ZoneDecimalTextField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  function commit(raw: string) {
    const parsed = Number.parseFloat(raw)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    const clamped = Math.max(min, Math.min(max, parsed))
    const rounded = Math.round(clamped * 10) / 10
    setDraft(String(rounded))
    onChange(rounded)
  }

  return (
    <label className={zoneFieldCardClassName()}>
      <span className={zoneFieldLabelClassName()}>{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          className={textNumericInputClassName}
        />
        {suffix && <span className="shrink-0 text-sm font-light text-text-muted">{suffix}</span>}
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
          {mapping.type === 'Note' && (
            <div className={mappingSectionClassName}>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Channel</span>
                <select
                  value={String(mapping.channel)}
                  onChange={(event) => onUpdate({ channel: Number(event.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>

              <div className={mappingDividerClassName} />

              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Root note</span>
                <select
                  value={mapping.rootNote ?? rootNoteOptions[0]}
                  onChange={(event) => onUpdate({ rootNote: event.target.value })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {rootNoteOptions.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Octave</span>
                <select
                  value={String(mapping.octave ?? 4)}
                  onChange={(event) => onUpdate({ octave: Number(event.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((octave) => (
                    <option key={octave} value={octave}>
                      {octave}
                    </option>
                  ))}
                </select>
              </div>

              <div className={mappingDividerClassName} />

              <div className={cvRowClassName}>
                <span className="text-xs uppercase tracking-wide text-text-muted">Split Zone</span>
                <ToggleSwitch
                  checked={split.enabled}
                  onChange={(enabled) => onUpdate({ split: { ...split, enabled } })}
                />
              </div>

              {split.enabled && (
                <div className={mappingSectionClassName}>
                  <div className={cvRowClassName}>
                    <span className={zoneFieldLabelClassName()}>Order</span>
                    <select
                      value={split.mode}
                      onChange={(event) =>
                        onUpdate({
                          split: {
                            ...split,
                            mode: event.target.value as typeof split.mode,
                          },
                        })
                      }
                      className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                    >
                      {(['Linear', 'Jump 2', 'Jump 3', 'Random'] as const).map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={cvRowClassName}>
                    <span className={zoneFieldLabelClassName()}>Split X</span>
                    <select
                      value={String(split.xDivisions)}
                      onChange={(event) =>
                        onUpdate({ split: { ...split, xDivisions: Number(event.target.value) } })
                      }
                      className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map((division) => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${cvRowClassName} mb-1`}>
                    <span className={zoneFieldLabelClassName()}>Split Y</span>
                    <select
                      value={String(split.yDivisions)}
                      onChange={(event) =>
                        onUpdate({ split: { ...split, yDivisions: Number(event.target.value) } })
                      }
                      className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map((division) => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-transparent text-sm font-light text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary"
                    >
                      Apply split
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {mapping.type === 'CC' && (
            <div className={mappingSectionClassName}>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Channel</span>
                <select
                  value={String(mapping.channel)}
                  onChange={(event) => onUpdate({ channel: Number(event.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Axis</span>
                <div className="flex items-center gap-2">
                  {(['Y', 'X'] as const).map((axis) => (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => onUpdate({ axis })}
                      className={mappingTabButtonClassName(mapping.axis === axis)}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>

              <div className={mappingDividerClassName} />

              {(mapping.ccInputMode ?? 'device') === 'device' && (
                <>
                  <div className={cvRowClassName}>
                    <span className={zoneFieldLabelClassName()}>Device</span>
                    <select
                      value={mapping.ccDeviceId ?? ''}
                      onChange={(event) => {
                        const deviceId = event.target.value
                        if (deviceId === '__add__') return
                        onUpdate({
                          ccDeviceId: deviceId || undefined,
                          ccParamId: undefined,
                          cc: undefined,
                        })
                      }}
                      className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                    >
                      <option value="">Select device</option>
                      {MIDI_DEVICES.map((device) => (
                        <option key={device.id} value={device.id}>
                          {device.name}
                        </option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="__add__">Add device...</option>
                    </select>
                  </div>
                  {mapping.ccDeviceId && (
                    <div className={cvRowClassName}>
                      <span className={zoneFieldLabelClassName()}>Parameter</span>
                      <select
                        value={mapping.ccParamId ?? ''}
                        onChange={(event) => {
                          const paramId = event.target.value || undefined
                          const param = findMidiParameter(mapping.ccDeviceId, paramId)
                          onUpdate({ ccParamId: paramId, cc: param?.cc })
                        }}
                        className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                      >
                        <option value="">Select parameter</option>
                        {findMidiDevice(mapping.ccDeviceId)?.parameters.map((param) => (
                          <option key={param.id} value={param.id}>
                            {param.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {mapping.ccParamId && (
                    <div className={cvRowClassName}>
                      <span className={zoneFieldLabelClassName()}>CC</span>
                      <span className="text-sm font-light text-text-muted">
                        {mapping.cc ?? '—'} · auto
                      </span>
                    </div>
                  )}
                </>
              )}
              {(mapping.ccInputMode ?? 'device') === 'manual' && (
                <div className={cvRowClassName}>
                  <span className={zoneFieldLabelClassName()}>CC number</span>
                  <div className={mappingNumericBoxClassName}>
                    <IntegerTextInput
                      value={mapping.cc ?? 0}
                      min={0}
                      max={127}
                      onChange={(cc) => onUpdate({ cc })}
                      className={mappingNumericInputClassName}
                    />
                  </div>
                </div>
              )}
              <div className={mappingCheckboxRowClassName}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      ccInputMode:
                        (mapping.ccInputMode ?? 'device') === 'manual' ? 'device' : 'manual',
                      ccDeviceId: undefined,
                      ccParamId: undefined,
                      cc: undefined,
                    })
                  }
                  className="flex cursor-pointer items-center gap-2"
                >
                  <span className="text-sm font-light text-text-muted">Manual input</span>
                  <SelectionCheckbox
                    checked={(mapping.ccInputMode ?? 'device') === 'manual'}
                    compact
                    ariaLabel="Manual input"
                    onToggle={() =>
                      onUpdate({
                        ccInputMode:
                          (mapping.ccInputMode ?? 'device') === 'manual' ? 'device' : 'manual',
                        ccDeviceId: undefined,
                        ccParamId: undefined,
                        cc: undefined,
                      })
                    }
                  />
                </button>
              </div>

              <div className={mappingDividerClassName} />

              {!mapping.singleValue ? (
                <>
                  <div className={cvRowClassName}>
                    <span className={zoneFieldLabelClassName()}>Min range</span>
                    <div className={mappingNumericBoxClassName}>
                      <IntegerTextInput
                        value={mapping.bottom ?? 0}
                        min={0}
                        max={127}
                        onChange={(bottom) => onUpdate({ bottom })}
                        className={mappingNumericInputClassName}
                      />
                    </div>
                  </div>
                  <div className={cvRowClassName}>
                    <span className={zoneFieldLabelClassName()}>Max range</span>
                    <div className={mappingNumericBoxClassName}>
                      <IntegerTextInput
                        value={mapping.top ?? 127}
                        min={0}
                        max={127}
                        onChange={(top) => onUpdate({ top })}
                        className={mappingNumericInputClassName}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={cvRowClassName}>
                  <span className={zoneFieldLabelClassName()}>Value</span>
                  <div className={mappingNumericBoxClassName}>
                    <IntegerTextInput
                      value={mapping.bottom ?? 0}
                      min={0}
                      max={127}
                      onChange={(bottom) => onUpdate({ bottom })}
                      className={mappingNumericInputClassName}
                    />
                  </div>
                </div>
              )}
              <div className={mappingCheckboxRowClassName}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      singleValue: !mapping.singleValue,
                      ...(!mapping.singleValue ? { top: mapping.bottom ?? 0 } : {}),
                    })
                  }
                  className="flex cursor-pointer items-center gap-2"
                >
                  <span className="text-sm font-light text-text-muted">Single value</span>
                  <SelectionCheckbox
                    checked={mapping.singleValue ?? false}
                    compact
                    ariaLabel="Single value"
                    onToggle={() =>
                      onUpdate({
                        singleValue: !mapping.singleValue,
                        ...(!mapping.singleValue ? { top: mapping.bottom ?? 0 } : {}),
                      })
                    }
                  />
                </button>
              </div>
            </div>
          )}

          {mapping.type === 'CV' && (
            <div className={mappingSectionClassName}>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Channel</span>
                <select
                  value={String(mapping.channel)}
                  onChange={(event) => onUpdate({ channel: Number(event.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Port</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((port) => (
                    <button
                      key={port}
                      type="button"
                      onClick={() => onUpdate({ port })}
                      className={mappingTabButtonClassName((mapping.port ?? 1) === port)}
                    >
                      CV{port}
                    </button>
                  ))}
                </div>
              </div>
              <div className={mappingDividerClassName} />
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Mode</span>
                <select
                  value={mapping.cvMode ?? 'Pitch'}
                  onChange={(event) => {
                    const match = CV_MODE_OPTIONS.find((option) => option.label === event.target.value)
                    if (match) {
                      onUpdate({ cvMode: match.value })
                    }
                  }}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {CV_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {(mapping.cvMode ?? 'Pitch') === 'Pitch' && (
                <div className={cvRowClassName}>
                  <span className={zoneFieldLabelClassName()}>V/oct</span>
                  <select
                    value={mapping.vOct ?? 'eurorack'}
                    onChange={(event) =>
                      onUpdate({ vOct: event.target.value as 'eurorack' | 'buchla' })
                    }
                    className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                  >
                    <option value="eurorack">Eurorack (1V/oct)</option>
                    <option value="buchla">Buchla (1.2V/oct)</option>
                  </select>
                </div>
              )}
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Axis</span>
                <div className="flex items-center gap-2">
                  {(['Y', 'X'] as const).map((axis) => (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => onUpdate({ axis })}
                      className={mappingTabButtonClassName(mapping.axis === axis)}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>
              <div className={mappingDividerClassName} />
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>
                  {mapping.singleValue ? 'Value' : 'Bottom'}
                </span>
                <StepperInput
                  value={mapping.bottom ?? -5}
                  min={-5}
                  max={5}
                  step={0.1}
                  onChange={(v) => onUpdate({ bottom: Math.round(v * 10) / 10 })}
                  formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} V`}
                />
              </div>
              {!mapping.singleValue && (
                <div className={cvRowClassName}>
                  <span className={zoneFieldLabelClassName()}>Top</span>
                  <StepperInput
                    value={mapping.top ?? 5}
                    min={-5}
                    max={5}
                    step={0.1}
                    onChange={(v) => onUpdate({ top: Math.round(v * 10) / 10 })}
                    formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} V`}
                  />
                </div>
              )}
              <div className={mappingCheckboxRowClassName}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      singleValue: !mapping.singleValue,
                      ...(!mapping.singleValue ? { top: mapping.bottom ?? -5 } : {}),
                    })
                  }
                  className="flex cursor-pointer items-center gap-2"
                >
                  <span className="text-sm font-light text-text-muted">Single value</span>
                  <SelectionCheckbox
                    checked={mapping.singleValue ?? false}
                    compact
                    ariaLabel="Single value"
                    onToggle={() =>
                      onUpdate({
                        singleValue: !mapping.singleValue,
                        ...(!mapping.singleValue ? { top: mapping.bottom ?? -5 } : {}),
                      })
                    }
                  />
                </button>
              </div>
            </div>
          )}

          {mapping.type === 'CV note' && (
            <div className={mappingSectionClassName}>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Channel</span>
                <select
                  value={String(mapping.channel)}
                  onChange={(e) => onUpdate({ channel: Number(e.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {CHANNEL_OPTIONS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </div>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Port</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((port) => (
                    <button key={port} type="button"
                      onClick={() => onUpdate({ port })}
                      className={mappingTabButtonClassName((mapping.port ?? 1) === port)}
                    >
                      CV{port}
                    </button>
                  ))}
                </div>
              </div>

              <div className={mappingDividerClassName} />

              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Root note</span>
                <select
                  value={mapping.rootNote ?? 'C'}
                  onChange={(e) => onUpdate({ rootNote: e.target.value })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {[...ROOT_NOTES].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Octave</span>
                <select
                  value={String(mapping.octave ?? 4)}
                  onChange={(e) => onUpdate({ octave: Number(e.target.value) })}
                  className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                >
                  {['-1','0','1','2','3','4','5','6','7','8','9'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className={mappingDividerClassName} />

              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>Gate</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((ch) => {
                    const isUsedByPort = ch === (mapping.port ?? 1)
                    return (
                      <button
                        key={ch}
                        type="button"
                        disabled={isUsedByPort}
                        onClick={() => !isUsedByPort && onUpdate({ gateChannel: ch })}
                        className={`${mappingTabButtonClassName((mapping.gateChannel ?? 2) === ch)} ${isUsedByPort ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        CV{ch}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
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
