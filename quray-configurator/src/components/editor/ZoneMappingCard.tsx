import { CaretRight, Check, MagnifyingGlass, PencilSimple, Trash } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MIDI_DEVICES, findMidiDevice } from '@/components/editor/midiDevices'
import {
  CHORD_TYPES,
  createDefaultMapping,
  CV_MODE_OPTIONS,
  MAPPING_TYPE_OPTIONS,
  mappingSummary,
  ROOT_NOTES,
  type ZoneMapping,
  type ZoneMappingType,
} from '@/components/editor/zoneMappings'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { useEditorZones } from '@/context/EditorZonesContext'
import { StepperInput } from '@/components/ui/StepperInput'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { buildScaleNotes, distributeNotes, NOTE_NAMES, SCALES } from '@/utils/scales'

const CHANNEL_OPTIONS = Array.from({ length: 16 }, (_, index) => String(index + 1))
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
    if (event.key === 'Enter') {
      commit(draft)
      return
    }
    if (event.ctrlKey || event.metaKey) return
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
      onFocus={(e) => { e.target.select() }}
      onBlur={() => commit(draft)}
      onKeyDown={handleKeyDown}
      className={className}
    />
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

const CHORD_INTERVALS: Record<string, number[]> = {
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  Sus2: [0, 2, 7],
  Sus4: [0, 5, 7],
  Power: [0, 7],
  Oct: [0, 12],
}

function getChordNotes(rootNote: string, octave: number, chordType: string): string[] {
  const intervals = CHORD_INTERVALS[chordType] ?? [0]
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const rootIndex = noteNames.indexOf(rootNote)
  if (rootIndex === -1) return [rootNote + octave]
  return intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12
    const octaveOffset = Math.floor((rootIndex + interval) / 12)
    return `${noteNames[noteIndex]}${octave + octaveOffset}`
  })
}

function CCDevicePopover({
  selectedDeviceId,
  myDevices,
  anchorRef,
  onSelect,
  onAddDevice,
  onRemoveDevice,
  onClose,
}: {
  selectedDeviceId?: string
  myDevices: string[]
  anchorRef: React.RefObject<HTMLDivElement | null>
  onSelect: (deviceId: string) => void
  onAddDevice: (deviceId: string) => void
  onRemoveDevice: (deviceId: string) => void
  onClose: () => void
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const POPOVER_HEIGHT = 380
    setPosition({
      top: Math.min(rect.top, window.innerHeight - POPOVER_HEIGHT - 16),
      left: Math.max(8, rect.left - 264 - 8),
    })
  }, [anchorRef])

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return
      if (anchorRef.current?.contains(e.target as Node)) return
      onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorRef, onClose])

  const myDeviceObjects = myDevices
    .map((id) => MIDI_DEVICES.find((d) => d.id === id))
    .filter(Boolean) as import('@/components/editor/midiDevices').MidiDevice[]

  const searchResults = search.length > 0
    ? MIDI_DEVICES.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) &&
          !myDevices.includes(d.id)
      )
    : []

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50, width: 264 }}
      className="rounded-xl border border-border-subtle bg-bg-elevated shadow-lg animate-[dropdown-enter_150ms_ease-out_both] overflow-hidden"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-6 py-3">
        <MagnifyingGlass size={14} className="shrink-0 text-text-muted" />
        <input
          autoFocus
          type="text"
          placeholder="Search to add devices..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setEditMode(false) }}
          className="min-w-0 flex-1 bg-transparent text-sm font-light text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto' }} className="pb-3">
        {/* My devices section */}
        {myDeviceObjects.length > 0 && search === '' && (
          <div className="pb-2">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">My devices</p>
              <button
                type="button"
                onClick={() => setEditMode(v => !v)}
                className="flex h-5 w-5 cursor-pointer items-center justify-center text-text-muted transition-colors duration-[120ms] hover:text-text-primary"
              >
                {editMode
                  ? <span className="text-xs font-light">Done</span>
                  : <PencilSimple size={16} weight="regular" />
                }
              </button>
            </div>
            <ul className="flex flex-col gap-0.5">
              {myDeviceObjects.map((device) => {
                const isSelected = device.id === selectedDeviceId
                return (
                  <li key={device.id}>
                    <div
                      className={`flex min-h-9 items-start justify-between gap-2 rounded-lg mx-3 px-3 py-2 transition-colors duration-[120ms] ${
                        !editMode ? 'cursor-pointer hover:bg-bg-row-hover' : ''
                      } ${isSelected && !editMode ? 'bg-bg-active' : ''}`}
                      onClick={() => { if (!editMode) { onSelect(device.id); onClose() } }}
                    >
                      <span className={`flex-1 min-w-0 text-sm font-light leading-snug ${isSelected && !editMode ? 'text-text-primary' : 'text-text-muted'}`}>
                        {device.name}
                      </span>
                      <div className="flex h-5 w-5 shrink-0 items-start justify-center pt-0.5">
                        {!editMode && isSelected && (
                          <Check size={14} weight="bold" className="text-text-primary" />
                        )}
                        {editMode && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemoveDevice(device.id) }}
                            className="flex cursor-pointer items-center justify-center text-text-muted transition-colors duration-[120ms] hover:text-status-error"
                          >
                            <Trash size={14} weight="regular" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {myDeviceObjects.length === 0 && search === '' && (
          <p className="px-6 py-4 text-sm font-light text-text-muted">
            Search to find and add devices from the database.
          </p>
        )}

        {/* Search results */}
        {search.length > 0 && (
          <>
            <p className="px-6 pt-5 pb-3 text-xs uppercase tracking-wide text-text-muted">Add to my devices</p>
            {searchResults.length === 0 ? (
              <p className="px-6 py-3 text-sm font-light text-text-muted">No devices found</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {searchResults.map((device) => (
                  <li
                    key={device.id}
                    className="flex items-start justify-between gap-3 rounded-lg px-6 py-2"
                  >
                    <span className="text-sm font-light text-text-muted leading-snug">{device.name}</span>
                    <button
                      type="button"
                      onClick={() => { onAddDevice(device.id); setSearch('') }}
                      className="mt-0.5 flex h-6 shrink-0 cursor-pointer items-center rounded-md border border-border-subtle px-2 text-xs font-light text-text-muted transition-colors duration-[120ms] hover:border-accent hover:text-accent"
                    >
                      + Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

function CCParameterPopover({
  device,
  selectedParamId,
  anchorRef,
  onSelect,
  onClose,
}: {
  device: import('@/components/editor/midiDevices').MidiDevice
  selectedParamId?: string
  anchorRef: React.RefObject<HTMLDivElement | null>
  onSelect: (paramId: string, cc: number) => void
  onClose: () => void
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(device.categories[0] ?? '')
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const POPOVER_WIDTH = 420
    const POPOVER_HEIGHT = 320
    setPosition({
      top: Math.min(rect.top, window.innerHeight - POPOVER_HEIGHT - 16),
      left: Math.max(8, rect.left - POPOVER_WIDTH - 8),
    })
  }, [anchorRef])

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return
      if (anchorRef.current?.contains(e.target as Node)) return
      onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorRef, onClose])

  const filteredParams = device.parameters.filter((p) => {
    const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = search !== '' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50, width: 420 }}
      className="rounded-xl border border-border-subtle bg-bg-elevated shadow-lg animate-[dropdown-enter_150ms_ease-out_both] overflow-hidden"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <MagnifyingGlass size={14} className="shrink-0 text-text-muted" />
        <input
          autoFocus
          type="text"
          placeholder="Search parameters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-light text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      <div className="flex" style={{ height: 280 }}>
        {/* Categories — only show when not searching */}
        {search === '' && (
          <div
            className="flex w-[160px] shrink-0 flex-col border-r border-border-subtle py-2 overflow-y-auto"
            style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)' }}
          >
            {device.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 text-left text-sm font-light transition-colors duration-[120ms] ${
                  selectedCategory === cat
                    ? 'bg-bg-active text-text-primary'
                    : 'text-text-muted hover:bg-bg-active hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Parameters */}
        <div
          className="flex flex-1 flex-col py-2 overflow-y-auto"
          style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)' }}
        >
          {filteredParams.length === 0 ? (
            <p className="px-4 py-5 text-sm font-light text-text-muted">No parameters found</p>
          ) : (
            filteredParams.map((param) => {
              const isSelected = param.id === selectedParamId
              return (
                <button
                  key={param.id}
                  type="button"
                  onClick={() => { onSelect(param.id, param.cc); onClose() }}
                  className={`flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-[120ms] ${
                    isSelected
                      ? 'bg-bg-active text-text-primary'
                      : 'text-text-muted hover:bg-bg-active hover:text-text-primary'
                  }`}
                >
                  <span className="text-sm font-light">{param.name}</span>
                  <span className="text-xs font-light text-text-muted shrink-0 ml-2">CC {param.cc}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
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
  const { myDevices, addMyDevice, removeMyDevice } = useEditorZones()
  const [devicePopoverOpen, setDevicePopoverOpen] = useState(false)
  const deviceAnchorRef = useRef<HTMLDivElement>(null)
  const [paramPopoverOpen, setParamPopoverOpen] = useState(false)
  const paramAnchorRef = useRef<HTMLDivElement>(null)
  const [savedDevice, setSavedDevice] = useState<{ ccDeviceId?: string; ccParamId?: string; cc?: number }>({})

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
                    <option key={channel} value={channel}>{channel}</option>
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
                <span className={zoneFieldLabelClassName()}>Mode</span>
                <div className="flex items-center gap-2">
                  {(['Single', 'Chord'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdate({ chordMode: mode === 'Single' ? 'single' : 'chord' })}
                      className={`${mappingTabButtonClassName(
                        (mapping.chordMode ?? 'single') === (mode === 'Single' ? 'single' : 'chord'),
                      )} !w-auto px-[10px]`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {(mapping.chordMode ?? 'single') === 'chord' && (
                <div className={cvRowClassName}>
                  <span className={zoneFieldLabelClassName()}>Chord</span>
                  <select
                    value={mapping.chordType ?? 'Major'}
                    onChange={(event) =>
                      onUpdate({ chordType: event.target.value as typeof CHORD_TYPES[number] })
                    }
                    className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
                  >
                    {CHORD_TYPES.map((chord) => (
                      <option key={chord} value={chord}>
                        {chord}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(mapping.chordMode ?? 'single') === 'chord' && (
                <div
                  className="flex flex-wrap justify-end gap-1 rounded-xl border border-border-subtle bg-bg-active px-3 py-2.5"
                  aria-label="Chord notes preview"
                >
                  {getChordNotes(
                    mapping.rootNote ?? 'C',
                    mapping.octave ?? 4,
                    mapping.chordType ?? 'Major',
                  ).map((note, index) => (
                    <span
                      key={`${note}-${index}`}
                      className="rounded bg-bg-hover px-2 py-1 text-xs font-light text-text-secondary"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              )}

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
                    className="flex flex-wrap justify-end gap-1 rounded-xl border border-border-subtle bg-bg-active px-3 py-2.5"
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
                  <div
                    ref={deviceAnchorRef}
                    className={`${zoneFieldCardClassName()} cursor-pointer transition-colors duration-[120ms] hover:bg-bg-hover`}
                    onClick={() => { setDevicePopoverOpen(v => !v); setParamPopoverOpen(false) }}
                  >
                    <span className={zoneFieldLabelClassName()}>Device</span>
                    <span className="text-sm font-light text-text-primary">
                      {mapping.ccDeviceId
                        ? findMidiDevice(mapping.ccDeviceId)?.name ?? 'Select device'
                        : 'Select device'
                      }
                    </span>
                  </div>
                  {devicePopoverOpen && (
                    <CCDevicePopover
                      selectedDeviceId={mapping.ccDeviceId}
                      myDevices={myDevices}
                      anchorRef={deviceAnchorRef}
                      onSelect={(deviceId) => onUpdate({ ccDeviceId: deviceId, ccParamId: undefined, cc: undefined })}
                      onAddDevice={addMyDevice}
                      onRemoveDevice={removeMyDevice}
                      onClose={() => setDevicePopoverOpen(false)}
                    />
                  )}
                  {mapping.ccDeviceId && (
                    <>
                      <div
                        ref={paramAnchorRef}
                        className={`${zoneFieldCardClassName()} cursor-pointer transition-colors duration-[120ms] hover:bg-bg-hover`}
                        onClick={() => { setParamPopoverOpen(v => !v); setDevicePopoverOpen(false) }}
                      >
                        <span className={zoneFieldLabelClassName()}>Parameter</span>
                        <span className={`text-sm font-light ${mapping.ccParamId ? 'text-text-primary' : 'text-text-muted'}`}>
                          {mapping.ccParamId
                            ? findMidiDevice(mapping.ccDeviceId)?.parameters.find((p) => p.id === mapping.ccParamId)?.name ?? 'Select parameter'
                            : 'Select parameter'
                          }
                        </span>
                      </div>
                      {paramPopoverOpen && (
                        <CCParameterPopover
                          device={findMidiDevice(mapping.ccDeviceId)!}
                          selectedParamId={mapping.ccParamId}
                          anchorRef={paramAnchorRef}
                          onSelect={(paramId, cc) => onUpdate({ ccParamId: paramId, cc })}
                          onClose={() => setParamPopoverOpen(false)}
                        />
                      )}
                    </>
                  )}
                  {mapping.ccParamId && (
                    <div className={cvRowClassName}>
                      <span className={zoneFieldLabelClassName()}>CC</span>
                      <span className="text-sm font-light text-text-muted">
                        {mapping.cc ?? '—'}
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
                  onClick={() => {
                    const isCurrentlyManual = (mapping.ccInputMode ?? 'device') === 'manual'
                    if (isCurrentlyManual) {
                      onUpdate({
                        ccInputMode: 'device',
                        ccDeviceId: savedDevice.ccDeviceId,
                        ccParamId: savedDevice.ccParamId,
                        cc: savedDevice.cc,
                      })
                    } else {
                      setSavedDevice({
                        ccDeviceId: mapping.ccDeviceId,
                        ccParamId: mapping.ccParamId,
                        cc: mapping.cc,
                      })
                      onUpdate({
                        ccInputMode: 'manual',
                        ccDeviceId: undefined,
                        ccParamId: undefined,
                        cc: undefined,
                      })
                    }
                  }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <span className="text-sm font-light text-text-muted">Manual input</span>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-[120ms] ${
                    (mapping.ccInputMode ?? 'device') === 'manual'
                      ? 'border-accent bg-accent'
                      : 'border-border-checkbox bg-transparent'
                  }`} aria-hidden="true">
                    {(mapping.ccInputMode ?? 'device') === 'manual' && (
                      <Check size={10} weight="bold" className="text-text-primary" />
                    )}
                  </span>
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
                <span className={zoneFieldLabelClassName()}>Port</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((port) => (
                    <button
                      key={port}
                      type="button"
                      onClick={() => onUpdate({ port })}
                      className={mappingTabButtonClassName((mapping.port ?? 1) === port)}
                    >
                      {String(port).padStart(2, '0')}
                    </button>
                  ))}
                </div>
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
              <div className={mappingDividerClassName} />
              <div className={cvRowClassName}>
                <span className={zoneFieldLabelClassName()}>
                  {mapping.singleValue ? 'Value' : 'Bottom'}
                </span>
                <StepperInput
                  value={mapping.bottom ?? -5}
                  min={-10}
                  max={10}
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
                    min={-10}
                    max={10}
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
                <span className={zoneFieldLabelClassName()}>Port</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4] as const).map((port) => (
                    <button key={port} type="button"
                      onClick={() => {
                        const newPort = port
                        const currentGate = mapping.gateChannel ?? 2
                        const newGate = currentGate === newPort
                          ? ([1, 2, 3, 4].find(ch => ch !== newPort) ?? 1)
                          : currentGate
                        onUpdate({ port: newPort, gateChannel: newGate })
                      }}
                      className={mappingTabButtonClassName((mapping.port ?? 1) === port)}
                    >
                      {String(port).padStart(2, '0')}
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
                        {String(ch).padStart(2, '0')}
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
