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
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
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
      onBlur={() => commit(draft)}
      onKeyDown={handleKeyDown}
      className={textNumericInputClassName}
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
          {mapping.type !== 'Note' && mapping.type !== 'CC' && (
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
              <ZoneFieldSelect
                label="Channel"
                value={String(mapping.channel)}
                options={CHANNEL_OPTIONS}
                onChange={(channel) => onUpdate({ channel: Number(channel) })}
              />
              <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-active pl-3 pr-1.5">
                <span className="shrink-0 text-sm font-light text-text-muted">Axis</span>
                <div className="flex items-center gap-2">
                  {(['Y', 'X'] as const).map((axis) => (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => onUpdate({ axis })}
                      className={`flex h-8 w-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-2px)] border text-xs font-light outline-none focus:outline-none focus-visible:outline-none ${
                        mapping.axis === axis
                          ? 'border-transparent bg-accent text-text-primary'
                          : 'border-border-subtle bg-bg-active text-text-muted hover:bg-bg-hover'
                      }`}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>
              {(mapping.ccInputMode ?? 'device') === 'device' && (
                <>
                  <div className={zoneFieldCardClassName()}>
                    <span className="shrink-0 text-sm font-light text-text-muted">Device</span>
                    <select
                      value={mapping.ccDeviceId ?? ''}
                      onChange={(event) => {
                        const deviceId = event.target.value
                        if (deviceId === '__add__') return
                        onUpdate({ ccDeviceId: deviceId || undefined, ccParamId: undefined, cc: undefined })
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
                    <div className={zoneFieldCardClassName()}>
                      <span className="shrink-0 text-sm font-light text-text-muted">Parameter</span>
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
                    <div className={zoneFieldCardClassName()}>
                      <span className="shrink-0 text-sm font-light text-text-muted">CC</span>
                      <span className="text-sm font-light text-text-muted">
                        {mapping.cc ?? '—'} · auto
                      </span>
                    </div>
                  )}
                </>
              )}
              {(mapping.ccInputMode ?? 'device') === 'manual' && (
                <div className={zoneFieldCardClassName()}>
                  <span className="shrink-0 text-sm font-light text-text-muted">CC number</span>
                  <IntegerTextInput
                    value={mapping.cc ?? 0}
                    min={0}
                    max={127}
                    onChange={(cc) => onUpdate({ cc })}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ccInputMode: (mapping.ccInputMode ?? 'device') === 'manual' ? 'device' : 'manual',
                    ccDeviceId: undefined,
                    ccParamId: undefined,
                    cc: undefined,
                  })
                }
                className="mb-2 ml-1 flex w-full cursor-pointer items-center gap-2"
              >
                <SelectionCheckbox
                  checked={(mapping.ccInputMode ?? 'device') === 'manual'}
                  compact
                  ariaLabel="Manual input"
                  onToggle={() =>
                    onUpdate({
                      ccInputMode: (mapping.ccInputMode ?? 'device') === 'manual' ? 'device' : 'manual',
                      ccDeviceId: undefined,
                      ccParamId: undefined,
                      cc: undefined,
                    })
                  }
                />
                <span className="text-sm font-light text-text-muted">Manual input</span>
              </button>
              {!mapping.singleValue ? (
                <div className="grid grid-cols-2 gap-3">
                  <ZoneIntegerTextField
                    label="Bottom"
                    value={mapping.bottom ?? 0}
                    min={0}
                    max={127}
                    onChange={(bottom) => onUpdate({ bottom })}
                  />
                  <ZoneIntegerTextField
                    label="Top"
                    value={mapping.top ?? 127}
                    min={0}
                    max={127}
                    onChange={(top) => onUpdate({ top })}
                  />
                </div>
              ) : (
                <ZoneIntegerTextField
                  label="Value"
                  value={mapping.bottom ?? 0}
                  min={0}
                  max={127}
                  onChange={(bottom) => onUpdate({ bottom, top: bottom })}
                />
              )}
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    singleValue: !mapping.singleValue,
                    ...(!mapping.singleValue ? { top: mapping.bottom ?? 0 } : {}),
                  })
                }
                className="ml-1 flex w-full cursor-pointer items-center gap-2"
              >
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
                <span className="text-sm font-light text-text-muted">Single value</span>
              </button>
            </>
          )}

          {mapping.type === 'CV' && (
            <>
              <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-active pl-3 pr-1.5">
                <span className="shrink-0 text-sm font-light text-text-muted">Port</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((port) => (
                    <button
                      key={port}
                      type="button"
                      onClick={() => onUpdate({ port })}
                      className={`flex h-8 w-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-2px)] border text-xs font-light outline-none focus:outline-none focus-visible:outline-none ${
                        (mapping.port ?? 1) === port
                          ? 'border-transparent bg-accent text-text-primary'
                          : 'border-border-subtle bg-bg-active text-text-muted hover:bg-bg-hover'
                      }`}
                    >
                      CV{port}
                    </button>
                  ))}
                </div>
              </div>
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
              {mapping.cvMode === 'Pitch' && (
                <div className={zoneFieldCardClassName()}>
                  <span className="shrink-0 text-sm font-light text-text-muted">V/oct</span>
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
              <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-active pl-3 pr-1.5">
                <span className="shrink-0 text-sm font-light text-text-muted">Axis</span>
                <div className="flex items-center gap-2">
                  {(['Y', 'X'] as const).map((axis) => (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => onUpdate({ axis })}
                      className={`flex h-8 w-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-xl)-2px)] border text-xs font-light outline-none focus:outline-none focus-visible:outline-none ${
                        mapping.axis === axis
                          ? 'border-transparent bg-accent text-text-primary'
                          : 'border-border-subtle bg-bg-active text-text-muted hover:bg-bg-hover'
                      }`}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>
              {!mapping.singleValue ? (
                <div className="grid grid-cols-2 gap-3">
                  <ZoneDecimalTextField
                    label="Bottom"
                    value={mapping.bottom ?? -5}
                    min={-5}
                    max={5}
                    suffix="V"
                    onChange={(bottom) => onUpdate({ bottom })}
                  />
                  <ZoneDecimalTextField
                    label="Top"
                    value={mapping.top ?? 5}
                    min={-5}
                    max={5}
                    suffix="V"
                    onChange={(top) => onUpdate({ top })}
                  />
                </div>
              ) : (
                <ZoneDecimalTextField
                  label="Value"
                  value={mapping.bottom ?? -5}
                  min={-5}
                  max={5}
                  suffix="V"
                  onChange={(bottom) => onUpdate({ bottom })}
                />
              )}
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    singleValue: !mapping.singleValue,
                    ...(!mapping.singleValue ? { top: mapping.bottom ?? -5 } : {}),
                  })
                }
                className="flex w-full cursor-pointer items-center justify-end gap-2"
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
