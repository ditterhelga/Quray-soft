import QurayLogo from '@/assets/icons/Quray-logo.svg?react'
import QurayLogoShort from '@/assets/icons/Quray-logo-short.svg?react'
import CloseBarIcon from '@/assets/icons/close-bar-icon.svg?react'
import LibraryIcon from '@/assets/icons/Library-icon.svg?react'
import DeviceIcon from '@/assets/icons/Device-icon.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  Check,
  MusicNote,
  Plus,
  SquaresFour,
  WarningCircle,
} from '@phosphor-icons/react'
import { zoneFieldCardClassName } from '@/components/editor/ZoneMappingCard'
import { ZONE_PALETTE } from '@/constants/zonePalette'
import { findEditorPreset } from '@/data/editorPresets'
import { useEditorZones } from '@/context/EditorZonesContext'
import type { EditorZone } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Divider } from '@/components/ui/Divider'
import { Tooltip } from '@/components/ui/Tooltip'

function editorZoneStatusSubLabel(zone: EditorZone): string | null {
  const parts: string[] = []
  if (zone.locked) parts.push('Locked')
  if (!zone.active) parts.push('Inactive')
  return parts.length > 0 ? parts.join(' · ') : null
}
import { AccountRow } from '@/components/layout/AccountRow'
import { NavItem } from '@/components/layout/NavItem'

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

const LAYOUTS = [
  { id: 'freehand', name: 'Freehand', zones: [] },
  {
    id: 'full',
    name: 'Full',
    zones: [
      { xMin: 0, xMax: 1, yMin: 0, yMax: 1, color: '#6C5BD9' },
    ],
  },
  {
    id: 'split2',
    name: 'Split 2',
    zones: [
      { xMin: 0, xMax: 0.5, yMin: 0, yMax: 1, color: '#6C5BD9' },
      { xMin: 0.5, xMax: 1, yMin: 0, yMax: 1, color: '#913F7E' },
    ],
  },
  {
    id: 'split3',
    name: 'Split 3',
    zones: [
      { xMin: 0, xMax: 0.33, yMin: 0, yMax: 1, color: '#6C5BD9' },
      { xMin: 0.33, xMax: 0.66, yMin: 0, yMax: 1, color: '#913F7E' },
      { xMin: 0.66, xMax: 1, yMin: 0, yMax: 1, color: '#B45846' },
    ],
  },
  {
    id: 'nearfar',
    name: 'Near / Far',
    zones: [
      { xMin: 0, xMax: 1, yMin: 0, yMax: 0.5, color: '#6C5BD9' },
      { xMin: 0, xMax: 1, yMin: 0.5, yMax: 1, color: '#3E8577' },
    ],
  },
  {
    id: 'wide2',
    name: 'Wide + 2',
    zones: [
      { xMin: 0, xMax: 0.5, yMin: 0, yMax: 1, color: '#6C5BD9' },
      { xMin: 0.5, xMax: 1, yMin: 0, yMax: 0.5, color: '#913F7E' },
      { xMin: 0.5, xMax: 1, yMin: 0.5, yMax: 1, color: '#B45846' },
    ],
  },
] as const

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
      <span className="mb-4 block text-center text-xs font-light text-text-muted">
        Sets the LED color on the device
      </span>
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
          <span className="pointer-events-none text-xs font-normal text-text-primary">A</span>
        </div>
        <div
          className="flex-1 flex items-center justify-end pr-4"
          onClick={() => setActiveTab('B')}
        >
          <span className="pointer-events-none text-xs font-normal text-text-primary">B</span>
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
      className="w-[240px] animate-[dropdown-enter_150ms_ease-out_both] rounded-xl border border-border-subtle bg-bg-elevated shadow-lg py-4"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
      }}
    >
      <ul className="flex flex-col gap-0.5 px-2">
        {SCALES_LIST.map((scaleName) => {
          const isSelected = scale === scaleName

          return (
            <li key={scaleName}>
              <button
                type="button"
                onClick={() => onScaleChange(scaleName)}
                className={
                  isSelected
                    ? 'flex h-9 w-full items-center justify-between rounded-lg px-4 text-sm font-light text-text-primary bg-bg-active'
                    : 'flex h-9 w-full items-center justify-between rounded-lg px-4 text-sm font-light text-text-muted hover:bg-bg-row-hover hover:text-text-primary transition-colors duration-[120ms]'
                }
              >
                {scaleName}
                {isSelected ? (
                  <span className="ml-auto flex w-[14px] shrink-0 items-center justify-center">
                    <Check size={14} weight="bold" className="text-text-primary" />
                  </span>
                ) : (
                  <span className="ml-auto w-[14px] shrink-0" aria-hidden="true" />
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="my-3 mx-6 border-t border-border-subtle" />

      <div className="px-6">
        <div
          className="flex cursor-pointer items-center py-2.5"
          onClick={() => rootSelectRef.current?.click()}
        >
          <span className="shrink-0 text-sm font-light text-text-muted">Root note</span>
          <div className="ml-auto flex items-center gap-1">
            <select
              ref={rootSelectRef}
              value={root}
              onChange={(event) => onRootChange(event.target.value)}
              className="min-w-0 cursor-pointer appearance-none bg-transparent text-right text-sm font-light text-text-primary outline-none"
            >
              {ROOT_NOTE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <CaretDown size={12} weight="regular" className="shrink-0 text-text-muted" aria-hidden="true" />
          </div>
        </div>
        <div className="flex items-center py-2.5">
          <span className="shrink-0 text-sm font-light text-text-muted">Octave</span>
          <div className="ml-auto flex items-center gap-1">
            <select
              value={String(octave)}
              onChange={(event) => onOctaveChange(Number(event.target.value))}
              className="min-w-0 cursor-pointer appearance-none bg-transparent text-right text-sm font-light text-text-primary outline-none"
            >
              {['-1','0','1','2','3','4','5','6','7','8','9'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <CaretDown size={12} weight="regular" className="shrink-0 text-text-muted" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FanPreview({ zones }: { zones: readonly { xMin: number; xMax: number; yMin: number; yMax: number; color: string }[] }) {
  const W = 80
  const H = 60
  const cx = W / 2
  const cy = H * 1.15
  const outerR = 56
  const innerR = 16
  const totalAngle = 96
  const startAngle = -90 - totalAngle / 2

  function sectorPath(xMin: number, xMax: number, yMin: number, yMax: number) {
    const a1 = (startAngle + xMin * totalAngle) * Math.PI / 180
    const a2 = (startAngle + xMax * totalAngle) * Math.PI / 180
    const r1 = innerR + yMin * (outerR - innerR)
    const r2 = innerR + yMax * (outerR - innerR)
    const x1 = cx + Math.cos(a1) * r2
    const y1 = cy + Math.sin(a1) * r2
    const x2 = cx + Math.cos(a2) * r2
    const y2 = cy + Math.sin(a2) * r2
    const x3 = cx + Math.cos(a2) * r1
    const y3 = cy + Math.sin(a2) * r1
    const x4 = cx + Math.cos(a1) * r1
    const y4 = cy + Math.sin(a1) * r1
    return `M ${x1} ${y1} A ${r2} ${r2} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 0 0 ${x4} ${y4} Z`
  }

  const fullPath = sectorPath(0, 1, 0, 1)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-hidden rounded-md">
      <defs>
        <clipPath id="fan-clip">
          <rect width={W} height={H} />
        </clipPath>
      </defs>
      <g clipPath="url(#fan-clip)">
        {zones.length === 0 ? (
          <>
            <path d={fullPath} fill="none" stroke="var(--color-border-subtle)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="16" fill="var(--color-text-muted)">+</text>
          </>
        ) : (
          <>
            <path d={fullPath} fill="var(--color-bg-base)" />
            {zones.map((z, i) => (
              <path key={i} d={sectorPath(z.xMin, z.xMax, z.yMin, z.yMax)} fill={z.color} opacity={0.85} />
            ))}
            <path d={fullPath} fill="none" stroke="var(--color-border-subtle)" strokeWidth={0.5} />
          </>
        )}
      </g>
    </svg>
  )
}

function PresetLayoutPopover({
  currentLayoutId,
  anchorRef,
  onClose,
  onApply,
  hasZones,
}: {
  currentLayoutId: string
  anchorRef: React.RefObject<HTMLButtonElement>
  onClose: () => void
  onApply: (layoutId: string) => void
  hasZones: boolean
}) {
  const [pendingLayoutId, setPendingLayoutId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const POPOVER_HEIGHT = 420
    setStyle({
      position: 'fixed',
      top: Math.min(rect.top, window.innerHeight - POPOVER_HEIGHT - 16),
      left: rect.right + 8,
      zIndex: 50,
      width: 280,
    })
  }, [])

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return
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
  }, [onClose])

  function handleSelect(layoutId: string) {
    if (layoutId === currentLayoutId) { onClose(); return }
    if (hasZones) {
      setPendingLayoutId(layoutId)
    } else {
      onApply(layoutId)
      onClose()
    }
  }

  return (
    <div
      ref={containerRef}
      style={style}
      className="rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-lg animate-[dropdown-enter_150ms_ease-out_both]"
    >
      {pendingLayoutId ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-light text-text-primary">Replace current zones?</p>
          <p className="text-xs font-light text-text-muted">This will remove all existing zones and cannot be undone.</p>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => { onApply(pendingLayoutId); onClose() }}
              className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg bg-accent text-sm font-light text-text-primary transition-colors duration-[120ms] hover:opacity-90"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => setPendingLayoutId(null)}
              className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border-subtle bg-transparent text-sm font-light text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {LAYOUTS.map((layout) => {
            const isSelected = layout.id === currentLayoutId
            const buttonClassName = `flex flex-col items-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors duration-[120ms] ${
              isSelected
                ? 'border-accent bg-bg-active'
                : 'border-border-subtle bg-bg-active hover:border-accent/50 hover:bg-bg-row-hover'
            }`
            const buttonContent = (
              <>
                {layout.id === 'freehand' ? (
                  <div className="flex h-[60px] w-[80px] items-center justify-center rounded-md border border-dashed border-border-subtle">
                    <Plus size={20} weight="light" className="text-text-muted" aria-hidden="true" />
                  </div>
                ) : (
                  <FanPreview zones={layout.zones} />
                )}
                <span className={`text-xs font-light ${isSelected ? 'text-text-primary' : 'text-text-muted'}`}>
                  {layout.name}
                </span>
              </>
            )

            if (layout.id === 'freehand') {
              return (
                <Tooltip key={layout.id} content="Draw zones freely on the canvas">
                  <button
                    type="button"
                    onClick={() => handleSelect(layout.id)}
                    className={buttonClassName}
                  >
                    {buttonContent}
                  </button>
                </Tooltip>
              )
            }

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => handleSelect(layout.id)}
                className={buttonClassName}
              >
                {buttonContent}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar({
  isCollapsed,
  onCollapsedChange,
  onOpenDeviceSettings,
}: SidebarProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const presetIdMatch = location.pathname.match(/^\/editor\/(.+)$/)
  const presetId = presetIdMatch?.[1]
  const editorPreset = presetId ? findEditorPreset(presetId) : undefined
  const MOCK_PRESET = {
    id: 'preset-1',
    name: editorPreset?.name ?? 'New Preset',
    colorA: '#1200e3',
    colorB: '#cd00ff',
  }
  const isEditor = location.pathname.startsWith('/editor/')
  const isFreshMode = location.pathname === '/' || searchParams.get('fresh') === '1'
  const navigate = useNavigate()
  const { zones, selectedZoneId, setSelectedZoneId, setZones, openZoneContextMenu, presetScale, setPresetScale, presetRoot, setPresetRoot, presetOctave, setPresetOctave } = useEditorZones()
  const [presetName, setPresetName] = useState(MOCK_PRESET.name)
  const [editingName, setEditingName] = useState(false)
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false)
  const [scalePopoverOpen, setScalePopoverOpen] = useState(false)
  const [layoutPopoverOpen, setLayoutPopoverOpen] = useState(false)
  const [currentLayoutId, setCurrentLayoutId] = useState('freehand')
  const [colorA, setColorA] = useState(MOCK_PRESET.colorA)
  const [colorB, setColorB] = useState(MOCK_PRESET.colorB)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const scaleButtonRef = useRef<HTMLButtonElement>(null)
  const layoutButtonRef = useRef<HTMLButtonElement>(null)

  function handleApplyLayout(layoutId: string) {
    const layout = LAYOUTS.find(l => l.id === layoutId)
    if (!layout) return
    setCurrentLayoutId(layoutId)
    const newZones: EditorZone[] = layout.zones.map((z, i) => ({
      id: `layout-${layoutId}-${i}-${Date.now()}`,
      name: `Zone ${i + 1}`,
      color: ZONE_PALETTE[i % ZONE_PALETTE.length],
      type: null,
      active: true,
      locked: false,
      position: [true, z.xMin, z.yMin, z.xMax, z.yMax] as [boolean, number, number, number, number],
      mappings: [],
    }))
    setZones(newZones)
    setSelectedZoneId(null)
  }

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
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Go to Library"
              className="cursor-pointer transition-opacity duration-[120ms] hover:opacity-80"
            >
              <QurayLogo className="block shrink-0" aria-hidden="true" />
            </button>
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
          <div className="flex min-h-0 flex-1 flex-col items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors duration-[120ms] hover:bg-bg-active hover:text-text-primary"
              aria-label="Back to Library"
            >
              <ArrowLeft size={20} className="shrink-0" />
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-0">
            <div className="px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="-ml-4 flex h-12 w-[calc(100%+1.5rem)] cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent pl-4 text-text-secondary hover:bg-white/[0.04] transition-colors duration-[120ms] ease-in-out"
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
                  ref={layoutButtonRef}
                  type="button"
                  onClick={() => setLayoutPopoverOpen(v => !v)}
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <SquaresFour size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Layout</span>
                    <span className="block text-left text-xs font-light text-text-muted">
                      {LAYOUTS.find(l => l.id === currentLayoutId)?.name ?? 'Freehand'}
                    </span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>
              </div>
            </div>

            <section className="min-h-0 flex-1 overflow-y-auto">
              <p className="mt-5 mb-3 shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Zones
              </p>

              {zones.length === 0 ? (
                <p className="px-6 py-2 text-sm font-light text-text-muted">
                  No zones yet. Draw on the canvas to add one.
                </p>
              ) : (
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
              )}
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

            {layoutPopoverOpen && (
              <PresetLayoutPopover
                currentLayoutId={currentLayoutId}
                anchorRef={layoutButtonRef}
                onClose={() => setLayoutPopoverOpen(false)}
                onApply={handleApplyLayout}
                hasZones={zones.length > 0}
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
            <NavItem
              to={isFreshMode ? '/device?fresh=1' : '/device'}
              label="Device"
              icon={DeviceIcon}
              isCollapsed={isCollapsed}
            />
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
                  {!isFreshMode && (
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
                  )}
                  {isFreshMode && (
                    <p className="px-6 py-3 text-sm font-light text-text-muted">No recent presets yet.</p>
                  )}
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
