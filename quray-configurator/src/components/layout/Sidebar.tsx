import QurayLogo from '@/assets/icons/Quray-logo.svg?react'
import QurayLogoShort from '@/assets/icons/Quray-logo-short.svg?react'
import CloseBarIcon from '@/assets/icons/close-bar-icon.svg?react'
import LibraryIcon from '@/assets/icons/Library-icon.svg?react'
import DeviceIcon from '@/assets/icons/Device-icon.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import {
  ArrowLeft,
  CaretRight,
  Check,
  MusicNote,
  SquaresFour,
  WarningCircle,
} from '@phosphor-icons/react'
import { zoneFieldCardClassName } from '@/components/editor/ZoneMappingCard'
import { useEditorZones } from '@/context/EditorZonesContext'
import type { EditorZone } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useLocation, useNavigate } from 'react-router-dom'
import { Divider } from '@/components/ui/Divider'

function editorZoneStatusSubLabel(zone: EditorZone): string | null {
  const parts: string[] = []
  if (zone.locked) parts.push('Locked')
  if (!zone.active) parts.push('Inactive')
  return parts.length > 0 ? parts.join(' · ') : null
}
import { AccountRow } from '@/components/layout/AccountRow'
import { NavItem } from '@/components/layout/NavItem'

const MOCK_PRESET = {
  id: 'preset-1',
  name: 'Bassline Filter Sweep',
  colorA: '#1200e3',
  colorB: '#cd00ff',
}

const mockSyncStatus = 'not-synced' as 'synced' | 'not-synced'
const mockAutosaveStatus = 'saved' as 'saving' | 'saved' | 'error'

const RECENT_PRESETS = [
  {
    label: 'Today',
    presets: [
      'Subharmonic Drift',
      'West Coast Buchla Gesture',
      'Tape Stop Gesture',
    ],
  },
  {
    label: 'Yesterday',
    presets: [
      'Mutable Clouds Wash',
      'Eurorack Clock Mult',
      'Quad VCA Swell',
    ],
  },
  {
    label: 'Earlier',
    presets: ['Acid Squelch Lane', 'Bipolar CV'],
  },
] as const

const SCALES_LIST = [
  'Chromatic',
  'Major (Ionian)',
  'Natural Minor (Aeolian)',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Locrian',
  'Major Pentatonic',
  'Minor Pentatonic',
] as const

const ROOT_NOTE_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

type SidebarProps = {
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onOpenDeviceSettings: () => void
}

type PresetColorPopoverProps = {
  colorA: string
  colorB: string
  onChange: (colorA: string, colorB: string) => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}

function PresetColorPopover({
  colorA,
  colorB,
  onChange,
  anchorRef,
  onClose,
}: PresetColorPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A')
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const activeColor = activeTab === 'A' ? colorA : colorB

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    setPosition({ top: rect.top, left: rect.right + 8 })
  }, [anchorRef])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node

      if (anchorRef.current?.contains(target)) {
        return
      }

      if (popoverRef.current?.contains(target)) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [anchorRef, onClose])

  function handleColorChange(nextColor: string) {
    if (activeTab === 'A') {
      onChange(nextColor, colorB)
    } else {
      onChange(colorA, nextColor)
    }
  }

  return (
    <div
      ref={popoverRef}
      className="w-[240px] animate-[dropdown-enter_150ms_ease-out_both] rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-lg"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
    >
      <div
        className="relative h-8 w-full rounded-lg mb-4 overflow-hidden cursor-pointer flex"
        style={{
          background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
        }}
      >
        <div
          className="flex-1 flex items-center justify-start pl-4"
          onClick={() => setActiveTab('A')}
        >
          <span className="pointer-events-none text-xs font-medium text-text-primary">A</span>
        </div>
        <div
          className="flex-1 flex items-center justify-end pr-4"
          onClick={() => setActiveTab('B')}
        >
          <span className="pointer-events-none text-xs font-medium text-text-primary">B</span>
        </div>
      </div>

      <div
        className="flex h-11 items-center gap-1 rounded-lg border border-border-subtle bg-bg-active p-1"
        role="tablist"
        aria-label="Color stop"
      >
        {(['A', 'B'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md text-xs font-light transition-colors duration-[120ms] ${
              activeTab === tab
                ? 'bg-accent text-text-primary'
                : 'bg-transparent text-text-muted hover:bg-bg-hover'
            }`}
          >
            Color {tab}
          </button>
        ))}
      </div>

      <HexColorPicker
        color={activeColor}
        onChange={handleColorChange}
        style={{ width: '100%' }}
        className="mt-3"
      />

      <label className={`${zoneFieldCardClassName()} mt-3`}>
        <span className="shrink-0 text-sm font-light text-text-muted">Hex</span>
        <input
          type="text"
          value={activeColor}
          onChange={(event) => handleColorChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-right text-sm font-light text-text-primary outline-none uppercase"
        />
      </label>

      <span className="mt-3 block text-center text-xs font-light text-text-muted">
        Sets the LED color on the device
      </span>
    </div>
  )
}

type PresetScalePopoverProps = {
  scale: string
  root: string
  octave: number
  onScaleChange: (scale: string) => void
  onRootChange: (root: string) => void
  onOctaveChange: (octave: number) => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}

const POPOVER_HEIGHT = 480

function PresetScalePopover({
  scale,
  root,
  octave,
  onScaleChange,
  onRootChange,
  onOctaveChange,
  anchorRef,
  onClose,
}: PresetScalePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const rootSelectRef = useRef<HTMLSelectElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    setPosition({
      top: Math.min(rect.top, window.innerHeight - POPOVER_HEIGHT - 16),
      left: rect.right + 8,
    })
  }, [anchorRef])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node

      if (anchorRef.current?.contains(target)) {
        return
      }

      if (popoverRef.current?.contains(target)) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [anchorRef, onClose])

  return (
    <div
      ref={popoverRef}
      className="w-[240px] animate-[dropdown-enter_150ms_ease-out_both] rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-lg"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
    >
      <ul className="flex flex-col gap-1">
        {SCALES_LIST.map((scaleName) => {
          const isSelected = scale === scaleName

          return (
            <li key={scaleName}>
              <button
                type="button"
                onClick={() => onScaleChange(scaleName)}
                className={
                  isSelected
                    ? 'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm font-light text-text-primary bg-bg-active'
                    : 'flex w-full items-center rounded-lg px-3 py-1.5 text-sm font-light text-text-muted hover:bg-bg-active hover:text-text-primary transition-colors duration-[120ms]'
                }
              >
                <span className="-ml-2">{scaleName}</span>
                {isSelected && (
                  <Check size={14} weight="bold" className="ml-auto -mr-2 shrink-0 text-text-primary" />
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="my-3 border-t border-border-subtle" />

      <div className="flex flex-col gap-3">
        <label
          className={zoneFieldCardClassName()}
          onClick={() => rootSelectRef.current?.click()}
        >
          <span className="shrink-0 text-sm font-light text-text-muted">Root note</span>
          <select
            ref={rootSelectRef}
            value={root}
            onChange={(event) => onRootChange(event.target.value)}
            className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
          >
            {ROOT_NOTE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className={zoneFieldCardClassName()}>
          <span className="shrink-0 text-sm font-light text-text-muted">Octave</span>
          <select
            value={String(octave)}
            onChange={(event) => onOctaveChange(Number(event.target.value))}
            className="min-w-0 cursor-pointer bg-transparent pr-1 text-right text-sm font-light text-text-primary outline-none"
          >
            {['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({
  isCollapsed,
  onCollapsedChange,
  onOpenDeviceSettings,
}: SidebarProps) {
  const location = useLocation()
  const isEditor = location.pathname === '/editor'
  const navigate = useNavigate()
  const { zones, selectedZoneId, setSelectedZoneId, openZoneContextMenu, presetScale, setPresetScale, presetRoot, setPresetRoot } = useEditorZones()
  const [presetName, setPresetName] = useState(MOCK_PRESET.name)
  const [editingName, setEditingName] = useState(false)
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false)
  const [scalePopoverOpen, setScalePopoverOpen] = useState(false)
  const [presetOctave, setPresetOctave] = useState(4)
  const [colorA, setColorA] = useState(MOCK_PRESET.colorA)
  const [colorB, setColorB] = useState(MOCK_PRESET.colorB)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const scaleButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-x-visible border-r border-border-panel bg-bg-sidebar transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-[64px]' : 'w-[264px]'
      }`}
    >
      <div
        className={`relative flex h-[72px] shrink-0 items-center transition-all duration-200 ease-in-out ${
          isCollapsed ? 'px-0' : 'px-6'
        }`}
      >
        <div className="relative min-w-0 flex-1 self-stretch">
          <div
            aria-hidden={isCollapsed}
            className={`absolute inset-y-0 flex items-center text-text-primary transition-all duration-200 ease-in-out ${
              isCollapsed
                ? 'pointer-events-none left-1/2 -translate-x-1/2 translate-y-1 opacity-0'
                : 'left-0 translate-x-0 translate-y-1 opacity-100'
            }`}
          >
            <QurayLogo className="block shrink-0" aria-label="Quray" />
          </div>

          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            aria-label="Expand sidebar"
            tabIndex={isCollapsed ? 0 : -1}
            className={`absolute inset-y-0 flex cursor-pointer items-center text-text-primary transition-all duration-200 ease-in-out hover:text-text-secondary ${
              isCollapsed
                ? 'left-1/2 -translate-x-1/2 translate-y-1 opacity-100'
                : 'pointer-events-none left-0 translate-x-0 translate-y-1 opacity-0'
            }`}
          >
            <QurayLogoShort className="block shrink-0" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onCollapsedChange(true)}
          aria-label="Collapse sidebar"
          aria-hidden={isCollapsed}
          tabIndex={isCollapsed ? -1 : 0}
          className={`flex shrink-0 cursor-pointer items-center overflow-hidden text-text-primary transition-all duration-200 ease-in-out hover:text-text-secondary ${
            isCollapsed
              ? 'pointer-events-none ml-0 w-0 min-w-0 opacity-0'
              : 'ml-3 w-5 opacity-100'
          }`}
        >
          <CloseBarIcon className="block shrink-0" />
        </button>
      </div>

      <Divider />

      {isEditor ? (
        isCollapsed ? (
          <div className="min-h-0 flex-1" aria-hidden="true" />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-0">
            <div className="px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="relative flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent pl-2 text-text-secondary hover:bg-white/[0.04] transition-colors duration-[120ms] ease-in-out"
              >
                <ArrowLeft size={20} className="shrink-0" />
                <span>Back to Library</span>
              </button>
            </div>

            <div className="px-6 pb-5 pt-4">
              {editingName ? (
                <input
                  autoFocus
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingName(false)
                    if (e.key === 'Escape') setEditingName(false)
                  }}
                  className="min-w-0 flex-1 bg-transparent text-lg font-light text-text-primary outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="min-w-0 flex-1 cursor-text truncate text-left text-lg font-light text-text-primary transition-opacity hover:opacity-80"
                >
                  {presetName}
                </button>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                {mockSyncStatus === 'synced' ? (
                  <StatusOnIcon className="h-3 w-3 shrink-0 text-status-positive" />
                ) : (
                  <StatusNoneIcon className="h-3 w-3 shrink-0 text-status-neutral" />
                )}
                <span>{mockSyncStatus === 'synced' ? 'Synced' : 'Not synced'}</span>

                <span className="opacity-30">·</span>

                {mockAutosaveStatus === 'saving' && <span>Saving…</span>}
                {mockAutosaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1.5">
                    <StatusOnIcon className="h-3 w-3 shrink-0 text-status-positive" />
                    Autosaved
                  </span>
                )}
                {mockAutosaveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-status-error">
                    <WarningCircle size={12} />
                    Not saved
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-5 shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Preset setup
              </p>

              <div className="flex flex-col gap-3 px-4 pb-5">
                <button
                  ref={colorButtonRef}
                  type="button"
                  onClick={() => setColorPopoverOpen((value) => !value)}
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Color</span>
                    <span className="block text-left text-xs font-light text-text-muted">Gradient</span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>

                <button
                  ref={scaleButtonRef}
                  type="button"
                  onClick={() => setScalePopoverOpen((value) => !value)}
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <MusicNote size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Scale</span>
                    <span className="block truncate text-left text-xs font-light text-text-muted">
                      {presetScale}
                    </span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>

                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <SquaresFour size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Layout</span>
                    <span className="block text-left text-xs font-light text-text-muted">Freehand</span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>
              </div>
            </div>

            <section className="min-h-0 flex-1 overflow-y-auto">
              <p className="mt-5 mb-3 shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Zones
              </p>

              <ul className="flex flex-col gap-3 px-4">
                {zones.map((zone, index) => {
                  const isSelected = zone.id === selectedZoneId
                  const statusSubLabel = editorZoneStatusSubLabel(zone)

                  return (
                    <li key={zone.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedZoneId(zone.id)}
                        onContextMenu={(event) => {
                          event.preventDefault()
                          setSelectedZoneId(zone.id)
                          openZoneContextMenu(zone.id, event.clientX, event.clientY)
                        }}
                        className={`flex items-center h-12 w-full pl-5 pr-4 rounded-xl border border-border-active bg-bg-active cursor-pointer hover:bg-bg-row-hover transition-colors duration-[120ms] ease-in-out ${
                          isSelected ? 'relative' : ''
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="absolute -left-px top-1/2 h-[28px] w-[3px] -translate-y-1/2 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span className="mr-5 shrink-0 text-sm font-medium text-text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1 text-left">
                          <span
                            className={`block truncate text-sm font-light ${
                              isSelected ? 'text-text-primary' : 'text-text-muted'
                            }`}
                          >
                            {zone.name}
                          </span>
                          {statusSubLabel && (
                            <span className="block text-[10px] leading-tight text-text-muted">
                              {statusSubLabel}
                            </span>
                          )}
                        </div>
                        <span
                          className="ml-auto h-[10px] w-[10px] shrink-0 rounded-sm"
                          style={{ background: zone.color }}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            {colorPopoverOpen && (
              <PresetColorPopover
                colorA={colorA}
                colorB={colorB}
                onChange={(nextColorA, nextColorB) => {
                  setColorA(nextColorA)
                  setColorB(nextColorB)
                }}
                anchorRef={colorButtonRef}
                onClose={() => setColorPopoverOpen(false)}
              />
            )}

            {scalePopoverOpen && (
              <PresetScalePopover
                scale={presetScale}
                root={presetRoot}
                octave={presetOctave}
                onScaleChange={setPresetScale}
                onRootChange={setPresetRoot}
                onOctaveChange={setPresetOctave}
                anchorRef={scaleButtonRef}
                onClose={() => setScalePopoverOpen(false)}
              />
            )}
          </div>
        )
      ) : (
        <>
          <nav
            className={`mt-8 shrink-0 flex flex-col gap-4 transition-all duration-200 ease-in-out ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <NavItem to="/" end label="Library" icon={LibraryIcon} isCollapsed={isCollapsed} />
            <NavItem to="/device" label="Device" icon={DeviceIcon} isCollapsed={isCollapsed} />
          </nav>

          {isCollapsed ? (
            <div className="min-h-0 flex-1" aria-hidden="true" />
          ) : (
            <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
              <Divider />

              <section className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
                <h2 className="shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                  Recent Presets
                </h2>

                <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-6 pb-4">
                    {RECENT_PRESETS.map((group) => (
                      <div key={group.label}>
                        <h3 className="pl-6 text-sm font-light text-text-muted">
                          {group.label}
                        </h3>
                        <ul className="mt-4 flex w-full flex-col gap-3 px-3">
                          {group.presets.map((name) => (
                            <li key={name} className="w-full">
                              <button
                                type="button"
                                className="block w-full min-w-0 cursor-pointer truncate rounded-lg px-3 py-1.5 text-left text-sm font-light text-text-primary opacity-70 transition duration-[120ms] ease-in-out hover:bg-bg-active hover:opacity-100"
                                title={name}
                              >
                                {name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      )}

      <AccountRow
        isCollapsed={isCollapsed}
        onOpenDeviceSettings={onOpenDeviceSettings}
      />
    </aside>
  )
}
