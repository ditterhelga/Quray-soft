import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowSquareOut,
  CaretDown,
  CaretRight,
  MusicNote,
  Plus,
  SquaresFour,
  Star,
  X,
} from '@phosphor-icons/react'
import LibraryIcon from '@/assets/icons/Library-icon.svg?react'
import { AccountRow } from '@/components/layout/AccountRow'
import { navLinkClass } from '@/components/layout/NavItem'
import {
  ActiveFilterBar,
  activeFilterBarClearAllClassName,
  activeFilterPillBodyClassName,
  activeFilterPillClassName,
  activeFilterPillClearClassName,
} from '@/components/library/ActiveFilterBar'
import { LibraryFiltersRow } from '@/components/library/LibraryFiltersRow'
import {
  LibraryViewToggle,
  type ListView,
} from '@/components/library/LibraryViewToggle'
import type { FilterAnchor } from '@/components/library/FilterDropdown'
import { FilterOptionRow } from '@/components/library/FilterDropdown'
import {
  EMPTY_FILTERS,
  FILTER_OPTIONS,
  type FilterKey,
  type LibraryFilters,
} from '@/components/library/filterOptions'
import { DevicePresetSlotRow } from '@/components/device/DevicePresetSlotRow'
import { DeviceSectionHeader } from '@/components/device/DeviceSectionHeader'
import { DeviceSetSlotRow } from '@/components/device/DeviceSetSlotRow'
import { DeviceSlotActions } from '@/components/device/DeviceSlotActions'
import { BulkActionBar } from '@/components/library/BulkActionBar'
import { AddPresetPickerModal } from '@/components/library/AddPresetPickerModal'
import { SetPickerModal } from '@/components/library/SetPickerModal'
import {
  PresetKebabMenu,
  PresetKebabMenuPanel,
  presetKebabMenuPanelSurfaceClassName,
  type PresetKebabMenuVariant,
} from '@/components/library/PresetKebabMenu'
import {
  SetKebabMenu,
  SetKebabMenuPanel,
  setKebabMenuPanelSurfaceClassName,
} from '@/components/library/SetKebabMenu'
import { SetRow } from '@/components/library/SetRow'
import {
  presetListTableHeaderClassName,
  presetListToolbarClassName,
} from '@/components/library/libraryLayout'
import { PresetRow } from '@/components/library/PresetRow'
import { PresetDetailPanel } from '@/components/library/PresetDetailPanel'
import { FanVisualization } from '@/components/library/FanVisualization'
import { FanCanvas } from '@/components/editor/FanCanvas'
import { ZoneMappingCard, createStyleguideMapping } from '@/components/editor/ZoneMappingCard'
import { ZoneSettings } from '@/components/editor/ZoneSettings'
import { applyMappingTypeChange } from '@/components/editor/zoneMappings'
import { EditorZonesProvider, useEditorZones } from '@/context/EditorZonesContext'
import { DeviceStatusBlock } from '@/components/device/DeviceStatusBlock'
import { DeviceToolbar } from '@/components/device/DeviceToolbar'
import { DeviceWorkingSetList } from '@/components/device/DeviceWorkingSetList'
import {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
} from '@/components/library/presetRowActions'
import { PresetTableSelectAllCheckbox } from '@/components/library/PresetTableSelectAllCheckbox'
import { presetRowNameWithCheckboxClassName } from '@/components/library/presetRowSelection'
import { PresetTableSortHeader } from '@/components/library/PresetTableSortHeader'
import {
  PRESET_TABLE_HEADER,
  PRESET_TABLE_HEADER_EXPLORE,
  PRESET_TABLE_HEADER_SETS,
  PRESET_TABLE_MIN_WIDTH_CLASS,
  PRESET_TABLE_STATUS_HEADER_CELL,
  PRESET_TABLE_ZONES_CELL_LIBRARY,
} from '@/components/library/presetTableLayout'
import { DEVICE_PRESET_SYNC, DEVICE_WORKING_SET } from '@/data/deviceWorkingSet'
import { PRESETS } from '@/data/presets'
import { EXPLORE_PRESETS } from '@/data/explorePresets'
import { SETS } from '@/data/sets'
import { getDeviceSlotId } from '@/utils/deviceSlots'
import { getSetPresetIds, getSetsContainingPreset } from '@/utils/setMembers'
import {
  OutputChip,
  ZoneBadge,
  formatOutputLabel,
} from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import {
  FavouritesToggleButton,
  favouritesToggleClassName,
} from '@/components/ui/FavouritesToggleButton'
import { FilterButton, filterButtonClassName, filterButtonLabelClassName } from '@/components/ui/FilterButton'
import { SearchField } from '@/components/ui/SearchField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { StepperInput } from '@/components/ui/StepperInput'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { tabClassName, tabGroupClassName } from '@/components/ui/Tab'
import {
  StatusChip,
  SYNC_STATUS_META,
  getSyncStatusLabel,
} from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import { Toast } from '@/components/ui/Toast'
import { StatusPill } from '@/components/ui/StatusPill'
import type { EditorZone, GesturePosition, SyncStatus } from '@/types'

const TOC = [
  {
    label: 'Foundations',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'radii', label: 'Radii' },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'status-pill', label: 'Status Pill' },
      { id: 'status-chip', label: 'Status Chip' },
      { id: 'button', label: 'Button' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'form-controls', label: 'Form Controls' },
      { id: 'filter-dropdown', label: 'Filter Dropdown' },
      { id: 'active-filter-bar', label: 'Active Filter Bar' },
      { id: 'view-toggle', label: 'View Toggle' },
      { id: 'bulk-selection', label: 'Bulk Selection' },
      { id: 'preset-row', label: 'Preset Row' },
      { id: 'fan-visualization', label: 'Fan Visualization' },
      { id: 'preset-detail-panel', label: 'Preset Detail Panel' },
      { id: 'set-row', label: 'Set Row' },
      { id: 'device-screen', label: 'Device Screen' },
      { id: 'set-picker', label: 'Set Picker' },
      { id: 'add-preset-picker', label: 'Add Preset Picker' },
      { id: 'nav-item', label: 'Nav Item' },
      { id: 'preset-setup-row', label: 'Preset Setup Row' },
      { id: 'account-row', label: 'Account Row' },
      { id: 'fan-canvas', label: 'Fan Canvas' },
      { id: 'zone-mapping-card', label: 'Zone Mapping Card' },
      { id: 'zone-settings', label: 'Zone Settings' },
      { id: 'editor-layout', label: 'Editor Layout' },
      { id: 'fan-geometry', label: 'Fan Geometry' },
      { id: 'device-page', label: 'Device Page' },
    ],
  },
  {
    label: 'Process',
    items: [{ id: 'process-notes', label: 'Process Notes' }],
  },
] as const

const STYLEGUIDE_NAV_WIDTH_CLASS = 'w-[264px]'

function styleguidePageClassName() {
  return 'min-h-screen bg-bg-base text-text-primary'
}

function styleguideLayoutClassName() {
  return 'flex items-start gap-10 py-16 pl-8 pr-12 lg:gap-12 lg:py-20 lg:pl-10 lg:pr-16'
}

function styleguideNavClassName() {
  return `sticky top-10 hidden h-fit shrink-0 self-start md:block ${STYLEGUIDE_NAV_WIDTH_CLASS}`
}

function styleguideMainClassName() {
  return 'flex-1 space-y-20 overflow-visible'
}

function StyleguideWidePreview({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <div className={PRESET_TABLE_MIN_WIDTH_CLASS}>{children}</div>
    </div>
  )
}

const COLOR_GROUPS = [
  {
    title: 'Backgrounds',
    tokens: [
      '--color-bg-base',
      '--color-bg-surface',
      '--color-bg-elevated',
      '--color-bg-sidebar',
      '--color-bg-main',
      '--color-bg-active',
      '--color-bg-row-hover',
      '--color-bg-hover',
      '--color-bg-hover-strong',
      '--color-bg-avatar',
      '--color-bg-chip',
      '--color-hero-top',
      '--color-hero-glow',
    ],
  },
  {
    title: 'Text',
    tokens: [
      '--color-text-primary',
      '--color-text-secondary',
      '--color-text-muted',
    ],
  },
  {
    title: 'Accent',
    tokens: ['--color-accent', '--color-accent-muted'],
  },
  {
    title: 'Borders',
    tokens: [
      '--color-border',
      '--color-border-panel',
      '--color-border-active',
      '--color-border-checkbox',
      '--color-divider',
    ],
  },
  {
    title: 'Status',
    tokens: [
      '--color-status-positive',
      '--color-status-progress',
      '--color-status-error',
      '--color-status-neutral',
    ],
  },
] as const

const TEXT_SCALE = [
  { token: '--text-xs', className: 'text-xs' },
  { token: '--text-sm', className: 'text-sm' },
  { token: '--text-base', className: 'text-base' },
  { token: '--text-lg', className: 'text-lg' },
  { token: '--text-xl', className: 'text-xl' },
] as const

const FONT_WEIGHTS = [
  { label: 'Light', weight: 300, className: 'font-light' },
  { label: 'Regular', weight: 400, className: 'font-normal' },
  { label: 'Medium', weight: 500, className: 'font-medium' },
] as const

const SPACING_STEPS = [
  { px: 4, label: '4px' },
  { px: 8, label: '8px' },
  { px: 12, label: '12px' },
  { px: 16, label: '16px' },
  { px: 24, label: '24px' },
  { px: 32, label: '32px' },
] as const

const RADIUS_DEMOS = [
  { token: '--radius-sm', label: 'radius-sm', fallback: '2px', className: 'rounded-sm' },
  { token: '--radius-md', label: 'radius-md', fallback: '4px', className: 'rounded-md' },
  { label: '8px (rounded-lg)', px: '8px', className: 'rounded-lg' },
  { label: '12px (rounded-xl)', px: '12px', className: 'rounded-xl' },
] as const

const STATUS_CHIPS: SyncStatus[] = ['on-quray', 'modified', 'not-synced']

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgb.trim()
  const [, r, g, b] = match
  return `#${[r, g, b].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function resolveCssValue(varName: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!raw) return ''
  if (raw.startsWith('#')) return raw.toUpperCase()
  if (raw.startsWith('rgb')) return rgbToHex(raw)
  return raw
}

function useResolvedColors() {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const group of COLOR_GROUPS) {
      for (const token of group.tokens) {
        const hex = resolveCssValue(token)
        if (hex) next[token] = hex
      }
    }
    setValues(next)
  }, [])

  return values
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8 overflow-visible">
      <h2 className="text-lg font-medium text-text-primary">{title}</h2>
      <div className="mt-6 overflow-visible rounded-lg border border-border p-8">{children}</div>
    </section>
  )
}

function ColorSwatch({ token, hex }: { token: string; hex: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-16 w-16 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div>
        <p className="font-mono text-xs text-text-primary">{token}</p>
        <p className="mt-1 text-xs text-text-muted">{hex}</p>
      </div>
    </div>
  )
}

const PRESET_SETUP_ROW_CLASSNAME =
  'flex items-center gap-3 h-14 px-4 rounded-xl border border-border-active bg-bg-active cursor-pointer hover:bg-bg-row-hover transition-colors duration-[120ms] ease-in-out'

function StyleguidePresetSetupRowDemo({
  state,
  label,
}: {
  state: 'default' | 'hover'
  label: string
}) {
  const className =
    state === 'hover'
      ? `${PRESET_SETUP_ROW_CLASSNAME} bg-bg-row-hover`
      : PRESET_SETUP_ROW_CLASSNAME

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-text-muted">{label}</span>
      <div className={className}>
        <MusicNote size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <span className="block text-sm text-text-primary">Scale</span>
          <span className="block text-xs text-text-muted">D Minor</span>
        </div>
        <CaretRight size={16} className="ml-auto shrink-0 text-text-muted" />
      </div>
    </div>
  )
}

const STYLEGUIDE_EDITOR_ZONES: EditorZone[] = [
  {
    id: 'sg-z1',
    name: 'Filter Sweep',
    color: '#5B8EE6',
    type: 'CC',
    active: true,
    locked: false,
    position: [true, 0.0, 0.2, 0.25, 0.9],
    mappings: [{
      id: 'sg-z1-m1',
      type: 'CC',
      channel: 1,
      axis: 'Y',
      cc: 74,
      singleValue: false,
      bottom: 0,
      top: 127,
    }],
  },
  {
    id: 'sg-z2',
    name: 'Root Note',
    color: '#7BB15B',
    type: 'Note',
    active: true,
    locked: false,
    position: [true, 0.25, 0.3, 0.55, 1.0],
    mappings: [{
      id: 'sg-z2-m1',
      type: 'Note',
      channel: 1,
      axis: 'Y',
      rootNote: 'C',
      octave: 4,
      split: { enabled: false, mode: 'Linear', xDivisions: 4, yDivisions: 1 },
    }],
  },
  {
    id: 'sg-z3',
    name: 'Sub Octave',
    color: '#CC9F2C',
    type: 'Note',
    active: true,
    locked: false,
    position: [true, 0.55, 0.1, 0.8, 0.85],
    mappings: [{
      id: 'sg-z3-m1',
      type: 'Note',
      channel: 1,
      axis: 'Y',
      rootNote: 'C',
      octave: 3,
      split: { enabled: false, mode: 'Linear', xDivisions: 4, yDivisions: 1 },
    }],
  },
  {
    id: 'sg-z4',
    name: 'Unmapped',
    color: '#8D95B2',
    type: null,
    active: true,
    locked: false,
    position: [true, 0.8, 0.2, 1.0, 0.7],
    mappings: [],
  },
]

function StyleguideFanCanvasDemo({
  zones,
  selectedZoneId,
  drawMode,
  onZoneSelect,
  onZoneCreate,
  onZoneUpdate,
}: {
  zones: EditorZone[]
  selectedZoneId: string | null
  drawMode: boolean
  onZoneSelect: (id: string | null) => void
  onZoneCreate: (position: GesturePosition) => void
  onZoneUpdate: (id: string, position: GesturePosition) => void
}) {
  return (
    <div className="h-full min-h-[360px] w-full">
      <FanCanvas
        zones={zones}
        selectedZoneId={selectedZoneId}
        drawMode={drawMode}
        onZoneSelect={onZoneSelect}
        onZoneCreate={onZoneCreate}
        onZoneUpdate={onZoneUpdate}
      />
    </div>
  )
}

function StyleguideSegmentedControlDemo() {
  const [axis, setAxis] = useState<'Y' | 'X' | 'Entry' | 'Exit'>('Y')

  return (
    <SegmentedControl
      value={axis}
      options={[
        { value: 'Y', label: 'Y' },
        { value: 'X', label: 'X' },
        { value: 'Entry', label: 'Entry' },
        { value: 'Exit', label: 'Exit' },
      ]}
      onChange={setAxis}
      ariaLabel="Axis preview"
      className="max-w-sm"
    />
  )
}

function StyleguideStepperInputDemo() {
  const [octave, setOctave] = useState(4)

  return <StepperInput value={octave} min={0} max={8} onChange={setOctave} />
}

function StyleguideZoneMappingCardDemo() {
  const [mapping, setMapping] = useState(() =>
    createStyleguideMapping({ id: 'sg-mapping-demo', type: 'CC', cc: 74, axis: 'Y' }),
  )
  const [isOpen, setIsOpen] = useState(true)

  const [splitMapping, setSplitMapping] = useState(() =>
    createStyleguideMapping({
      id: 'sg-mapping-split',
      type: 'Note',
      rootNote: 'C',
      octave: 4,
      split: { enabled: true, mode: 'Linear', xDivisions: 4, yDivisions: 1 },
    }),
  )
  const [splitOpen, setSplitOpen] = useState(true)

  return (
    <EditorZonesProvider>
      <div className="max-w-sm space-y-3">
        <ZoneMappingCard
          mapping={mapping}
          isOpen={isOpen}
          onToggle={() => setIsOpen((value) => !value)}
          onUpdate={(patch) => setMapping((current) => ({ ...current, ...patch }))}
          onTypeChange={(type) =>
            setMapping((current) => applyMappingTypeChange(current, type))
          }
          onDelete={() => setIsOpen(false)}
        />
        <ZoneMappingCard
          mapping={splitMapping}
          isOpen={splitOpen}
          onToggle={() => setSplitOpen((v) => !v)}
          onUpdate={(patch) => setSplitMapping((current) => ({ ...current, ...patch }))}
          onTypeChange={(type) =>
            setSplitMapping((current) => applyMappingTypeChange(current, type))
          }
          onDelete={() => setSplitOpen(false)}
          presetScale="Natural Minor"
          presetRoot="A"
        />
      </div>
    </EditorZonesProvider>
  )
}

function StyleguideZoneSettingsDemoInner({
  selectedZoneId,
  className = '',
}: {
  selectedZoneId: string | null
  className?: string
}) {
  const { zones, setZones } = useEditorZones()

  const onZonePatch = useCallback((
    id: string,
    patch: Partial<Pick<EditorZone, 'name' | 'color' | 'type' | 'active' | 'locked'>>,
  ) => {
    setZones((prev) => prev.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)))
  }, [setZones])

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
      <ZoneSettings
        selectedZoneId={selectedZoneId}
        zones={zones}
        onZonePatch={onZonePatch}
      />
    </div>
  )
}

function StyleguideZoneSettingsDemo({
  selectedZoneId,
  initialZones,
  className = '',
}: {
  selectedZoneId: string | null
  initialZones: EditorZone[]
  className?: string
}) {
  return (
    <EditorZonesProvider initialZones={initialZones}>
      <StyleguideZoneSettingsDemoInner
        selectedZoneId={selectedZoneId}
        className={className}
      />
    </EditorZonesProvider>
  )
}

function StyleguideEditorLayoutDemoInner() {
  const { zones, setZones } = useEditorZones()
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('sg-z1')
  const [drawMode, setDrawMode] = useState(false)

  const handleZoneSelect = useCallback((id: string | null) => {
    setSelectedZoneId(id)
    if (id !== null) setDrawMode(false)
  }, [])

  const handleZoneCreate = useCallback((position: GesturePosition) => {
    const newZone: EditorZone = {
      id: `sg-new-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      color: '#5145F2',
      type: null,
      active: true,
      locked: false,
      position,
      mappings: [],
    }
    setZones((prev) => [...prev, newZone])
    setSelectedZoneId(newZone.id)
    setDrawMode(false)
  }, [zones.length, setZones])

  const handleZoneUpdate = useCallback((id: string, position: GesturePosition) => {
    setZones((prev) => prev.map((zone) => (zone.id === id ? { ...zone, position } : zone)))
  }, [setZones])

  const handleZonePatch = useCallback((
    id: string,
    patch: Partial<Pick<EditorZone, 'name' | 'color' | 'type' | 'active' | 'locked'>>,
  ) => {
    setZones((prev) => prev.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)))
  }, [setZones])

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setDrawMode((value) => !value)}
        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
          drawMode
            ? 'bg-accent text-text-primary'
            : 'border border-border bg-bg-elevated text-text-secondary'
        }`}
      >
        {drawMode ? 'Drawing…' : 'Draw zone'}
      </button>

      <div className="flex h-[420px] overflow-hidden rounded-lg border border-border">
        <main className="relative h-full min-h-0 min-w-0 flex-1">
          <StyleguideFanCanvasDemo
            zones={zones}
            selectedZoneId={selectedZoneId}
            drawMode={drawMode}
            onZoneSelect={handleZoneSelect}
            onZoneCreate={handleZoneCreate}
            onZoneUpdate={handleZoneUpdate}
          />
        </main>
        <aside
          className="flex w-80 shrink-0 flex-col overflow-y-auto border-l"
          style={{
            borderColor: 'var(--color-border-panel)',
            background: 'var(--color-bg-sidebar)',
          }}
        >
          <ZoneSettings
            selectedZoneId={selectedZoneId}
            zones={zones}
            onZonePatch={handleZonePatch}
          />
        </aside>
      </div>
    </div>
  )
}

function StyleguideEditorLayoutDemo() {
  return (
    <EditorZonesProvider initialZones={STYLEGUIDE_EDITOR_ZONES}>
      <StyleguideEditorLayoutDemoInner />
    </EditorZonesProvider>
  )
}

function StyleguideDevicePageDemo() {
  const [slots, setSlots] = useState(() => [...DEVICE_WORKING_SET])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [showToast, setShowToast] = useState(false)

  const presetSync = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DEVICE_PRESET_SYNC) as [string, 'current' | 'needs-sync'][],
      ) as typeof DEVICE_PRESET_SYNC,
    [],
  )

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border bg-bg-base">
        <div className="hero-glow pb-8">
          <DeviceToolbar
            hasStagedChanges
            arrangementChangeCount={1}
            updateCount={2}
            onUpdateQuray={() => setShowToast(true)}
          />
          <DeviceStatusBlock
            status={{ usedMb: 2.1, totalMb: 8, firmwareVersion: '1.22' }}
          />
        </div>
        <DeviceWorkingSetList
          slots={slots}
          sets={SETS}
          presets={PRESETS}
          presetSync={presetSync}
          selectedIds={selectedIds}
          onToggleSelect={(slotId) => {
            setSelectedIds((current) => {
              const next = new Set(current)
              if (next.has(slotId)) next.delete(slotId)
              else next.add(slotId)
              return next
            })
          }}
          onSelectAll={() => setSelectedIds(new Set(slots.map((slot) => getDeviceSlotId(slot))))}
          onClearSelection={() => setSelectedIds(new Set())}
          onReorderSlots={setSlots}
          onEditSet={() => undefined}
          onEditPreset={() => undefined}
          onRemoveSlot={() => undefined}
          onBulkRemove={() => undefined}
        />
      </div>

      {showToast && (
        <Toast
          message="Quray updated."
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

function StyleguideNavDemo({
  state,
  label,
}: {
  state: 'default' | 'active' | 'hover'
  label: string
}) {
  const isActive = state === 'active'
  const base = navLinkClass(isActive, false)
  const className =
    state === 'hover'
      ? `${base} border-transparent bg-white/[0.04] text-text-secondary`
      : base

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-text-muted">{label}</span>
      <div className={className}>
        {isActive && (
          <span
            className="absolute -left-px top-1/2 h-[28px] w-[3px] -translate-y-1/2 bg-accent"
            aria-hidden="true"
          />
        )}
        <LibraryIcon className="shrink-0" aria-hidden="true" />
        <span>Library</span>
      </div>
    </div>
  )
}

function StyleguideGuestAccountRow() {
  return (
    <div className="flex items-center pl-6 pr-6 pb-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-avatar text-sm text-text-muted">
        ?
      </div>
      <div className="ml-3 flex min-w-0 flex-1 items-center justify-between gap-3">
        <p className="text-sm font-light text-text-muted">
          Sign in to save your presets
        </p>
        <button
          type="button"
          className="shrink-0 cursor-pointer text-sm font-light text-accent transition-colors duration-[120ms] hover:text-text-primary"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

function StyleguideSearchFieldDemo() {
  const [query, setQuery] = useState('')

  return (
    <SearchField
      className="flex-none"
      value={query}
      onValueChange={setQuery}
    />
  )
}

function StyleguideSetPickerDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open set picker</Button>
      <SetPickerModal
        open={open}
        title="Add to set"
        sets={SETS}
        onClose={() => setOpen(false)}
        onSelectSet={() => undefined}
        onCreateSet={() => undefined}
      />
    </>
  )
}

function StyleguideAddPresetPickerDemo() {
  const [open, setOpen] = useState(false)
  const demoSet = SETS[1]

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open add preset picker</Button>
      <AddPresetPickerModal
        open={open}
        presets={PRESETS}
        setPresetIds={getSetPresetIds(demoSet)}
        onClose={() => setOpen(false)}
        onAdd={() => undefined}
        onCreatePreset={() => undefined}
      />
    </>
  )
}

function StyleguideFiltersRowDemo() {
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_FILTERS)
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [openFilterAnchor, setOpenFilterAnchor] = useState<FilterAnchor | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyFavourites, setOnlyFavourites] = useState(false)

  function handleOpenFilterChange(
    key: FilterKey | null,
    anchor: FilterAnchor | null,
  ) {
    setOpenFilter(key)
    setOpenFilterAnchor(anchor)
  }

  function handleClearAll() {
    setFilters(EMPTY_FILTERS)
    setOnlyFavourites(false)
    setOpenFilter(null)
    setOpenFilterAnchor(null)
  }

  return (
    <div>
      <LibraryFiltersRow
        activeTab="library"
        filters={filters}
        onFilterChange={(key, selected) =>
          setFilters((current) => ({ ...current, [key]: selected }))
        }
        openFilter={openFilter}
        openFilterAnchor={openFilterAnchor}
        onOpenFilterChange={handleOpenFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onlyFavourites={onlyFavourites}
        onOnlyFavouritesChange={setOnlyFavourites}
      />
      <ActiveFilterBar
        activeTab="library"
        filters={filters}
        onlyFavourites={onlyFavourites}
        openFilter={openFilter}
        openFilterAnchor={openFilterAnchor}
        onOpenFilterChange={handleOpenFilterChange}
        onFilterChange={(key, selected) =>
          setFilters((current) => ({ ...current, [key]: selected }))
        }
        onOnlyFavouritesChange={setOnlyFavourites}
        onClearAll={handleClearAll}
      />
    </div>
  )
}

function StyleguideViewToggleDemo() {
  const [view, setView] = useState<ListView>('presets')

  return (
    <div className="flex flex-wrap items-end gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-text-muted">Interactive</span>
        <LibraryViewToggle value={view} onChange={setView} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-text-muted">Sets active (+ New set link)</span>
        <LibraryViewToggle value="sets" onChange={() => undefined} onNewSet={() => undefined} />
      </div>
    </div>
  )
}

function StyleguideFilterDropdownPanel({
  options,
  title,
}: {
  options: typeof FILTER_OPTIONS.status
  title: string
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <div className="inline-block rounded-lg border border-border bg-bg-active py-1 shadow-lg">
        <FilterOptionRow
          option={options[0]}
          selected={false}
          onToggle={() => undefined}
        />
        <div className="bg-bg-hover">
          <FilterOptionRow
            option={options[1]}
            selected={false}
            onToggle={() => undefined}
            showCheckbox
          />
        </div>
        <FilterOptionRow
          option={options[2]}
          selected
          onToggle={() => undefined}
        />
      </div>
      <p className="mt-3 text-xs text-text-muted">Rest · hover · selected</p>
    </div>
  )
}

function StyleguidePresetKebabMenuPanel({
  title,
  presetId,
  variant = 'library',
}: {
  title: string
  presetId: string
  variant?: PresetKebabMenuVariant
}) {
  const menuId = useId()

  return (
    <div>
      <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <PresetKebabMenuPanel
        menuId={menuId}
        presetId={presetId}
        variant={variant}
        className={presetKebabMenuPanelSurfaceClassName()}
      />
    </div>
  )
}

function StyleguideSetKebabMenuPanel({
  title,
  setId,
}: {
  title: string
  setId: string
}) {
  const menuId = useId()

  return (
    <div>
      <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <SetKebabMenuPanel
        menuId={menuId}
        setId={setId}
        className={setKebabMenuPanelSurfaceClassName()}
      />
    </div>
  )
}

export function Styleguide() {
  const colorValues = useResolvedColors()
  const [activeId, setActiveId] = useState<string>(TOC[0].items[0].id)

  useEffect(() => {
    const sectionIds = TOC.flatMap((g) => g.items.map((i) => i.id))
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styleguidePageClassName()}>
      <div className={styleguideLayoutClassName()}>
        <nav
          className={styleguideNavClassName()}
          aria-label="Styleguide sections"
        >
          {TOC.map((group) => (
            <div key={group.label} className="mb-8 last:mb-0">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors duration-[120ms] ${
                        activeId === item.id
                          ? 'bg-bg-active font-medium text-text-primary'
                          : 'font-light text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main className={styleguideMainClassName()}>
          <header>
            <h1 className="text-3xl font-medium text-text-primary">Quray Design System</h1>
            <p className="mt-2 text-lg font-light text-text-secondary">
              Living component reference — Quray configurator
            </p>
            <div className="mt-8">
              <Divider />
            </div>
          </header>

          <Section id="colors" title="Colors">
            <div className="space-y-10">
              {COLOR_GROUPS.map((group) => {
                const swatches = group.tokens
                  .map((token) => ({ token, hex: colorValues[token] }))
                  .filter((s) => s.hex)

                if (swatches.length === 0) return null

                return (
                  <div key={group.title}>
                    <h3 className="mb-4 text-sm font-medium text-text-secondary">{group.title}</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-8">
                      {swatches.map(({ token, hex }) => (
                        <ColorSwatch key={token} token={token} hex={hex} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section id="typography" title="Typography">
            <div className="space-y-12">
              <div>
                <h3 className="mb-6 text-sm font-medium text-text-secondary">Font size scale</h3>
                <div className="space-y-6">
                  {TEXT_SCALE.map(({ token, className }) => (
                    <TypographyRow key={token} token={token} className={className} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-6 text-sm font-medium text-text-secondary">Font weights</h3>
                <div className="space-y-5">
                  {FONT_WEIGHTS.map(({ label, weight, className }) => (
                    <div key={weight} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                      <p className={`min-w-[12rem] text-base ${className} text-text-primary`}>
                        The quick brown fox jumps over the lazy dog.
                      </p>
                      <p className="shrink-0 font-mono text-xs text-text-muted">
                        {label} · {weight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="spacing" title="Spacing">
            <div className="space-y-6">
              {SPACING_STEPS.map(({ px, label }) => (
                <div key={px} className="flex items-center gap-6">
                  <div
                    className="h-3 shrink-0 rounded-sm bg-accent"
                    style={{ width: px }}
                  />
                  <span className="font-mono text-xs text-text-muted">{label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="radii" title="Radii">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-8">
              {RADIUS_DEMOS.map((demo) => (
                <RadiusDemo key={'token' in demo ? demo.token : demo.label} demo={demo} />
              ))}
            </div>
          </Section>

          <Section id="status-pill" title="Status Pill">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Status states
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <StatusPill label="Connected" status="positive" />
                  <StatusPill label="Connecting" status="progress" />
                  <StatusPill label="Disconnected" status="neutral" />
                  <StatusPill label="Error" status="error" />
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Hover and open
                </p>
                <div className="flex flex-wrap items-start gap-5">
                  <StatusPill label="Connected" status="positive" menu="connected" />
                  <StatusPill label="Calibrated" status="positive" menu="calibrated" />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Hover: background shifts to bg-hover (#393A52). Open: dropdown on
                  hover with gap + invisible bridge below pill (150ms close delay).
                  Escape closes. Desktop-only — no touch hover.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Shows device or sync state in the header. Color encodes state.
            </p>
          </Section>

          <Section id="status-chip" title="Status Chip">
            <div className="flex flex-wrap items-end gap-10">
              {STATUS_CHIPS.map((status) => {
                const meta = SYNC_STATUS_META[status]

                return (
                  <div key={status} className="flex flex-col items-center gap-3">
                    <StatusChip status={status} />
                    <div className="text-center">
                      <p className="text-xs text-text-primary">{getSyncStatusLabel(status)}</p>
                      <p className="mt-1 font-mono text-xs text-text-muted">
                        {meta.iconClassName}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Sync status in preset table · status-on / status-modified / status-none SVGs
              (currentColor) · bg-chip pod · rounded-sm · px-2 py-1.5 · tooltip on hover.
            </p>
          </Section>

          <Section id="button" title="Button">
            <div className="flex flex-wrap items-end gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-text-muted">Default</span>
                <Button icon={Plus}>New preset</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-text-muted">Hover (interactive)</span>
                <Button icon={Plus}>New preset</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-text-muted">Disabled</span>
                <Button icon={Plus} disabled>
                  New preset
                </Button>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Primary action — accent fill, 48px height, rounded-lg, Plus icon.
            </p>
          </Section>

          <Section id="tabs" title="Tabs">
            <div className={tabGroupClassName()}>
              <span className={tabClassName(true)}>My library</span>
              <span className={tabClassName(false)}>Explore presets</span>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Underline tabs at text-xl · 48px row height · accent underline positioned
              absolutely (does not shift text) · inactive secondary, font-light, hover
              brightens to primary.
            </p>
          </Section>

          <Section id="form-controls" title="Form Controls">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Search field
                </p>
                <div className="flex max-w-2xl flex-col gap-4">
                  <StyleguideSearchFieldDemo />
                  <p className="text-sm font-light text-text-muted">
                    flex-1 · min-width 240px · 48px height · placeholder 70% opacity · clear
                    button when typing
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Filter button
                </p>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-text-muted">Default</span>
                    <FilterButton label="Status" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-text-muted">Hover</span>
                    <button type="button" className={filterButtonClassName(true)}>
                      <span className={filterButtonLabelClassName(true)}>Status</span>
                      <CaretDown
                        size={16}
                        weight="regular"
                        className="shrink-0 text-text-muted"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Fixed 180×48px · label 70% opacity at rest, full on hover · CaretDown unchanged
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Toggle switch
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <ToggleSwitch checked={false} onChange={() => undefined} label="Off" />
                  <ToggleSwitch checked onChange={() => undefined} label="On" />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  36×20px track · accent fill when on · 16px thumb
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Segmented control
                </p>
                <StyleguideSegmentedControlDemo />
                <p className="mt-4 text-sm font-light text-text-muted">
                  36px height · flex-1 segments · selected uses bg-active + border-active
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Stepper input
                </p>
                <StyleguideStepperInputDemo />
                <p className="mt-4 text-sm font-light text-text-muted">
                  36px height · rounded-xl card border · ± buttons with centred value
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Favourites toggle
                </p>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-text-muted">Off</span>
                    <FavouritesToggleButton active={false} onToggle={() => undefined} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-text-muted">Hover</span>
                    <button
                      type="button"
                      className={favouritesToggleClassName('hover')}
                      aria-label="Favourites hover preview"
                    >
                      <Star
                        size={20}
                        weight="fill"
                        className="text-text-muted"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-text-muted">Active</span>
                    <FavouritesToggleButton active onToggle={() => undefined} />
                  </div>
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  48×48px · outline star at rest · filled on hover or when filter is on
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Filters row (composed)
                </p>
                <StyleguideFiltersRowDemo />
              </div>
            </div>
          </Section>

          <Section id="filter-dropdown" title="Filter Dropdown">
            <div className="flex flex-wrap items-start gap-10">
              <StyleguideFilterDropdownPanel
                title="Status (with icons)"
                options={FILTER_OPTIONS.status}
              />
              <StyleguideFilterDropdownPanel
                title="Output (no icons)"
                options={FILTER_OPTIONS.output}
              />
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Click to open · multi-select · checkbox visible on hover or when selected ·
              closes on outside-click and Escape.
            </p>
          </Section>

          <Section id="active-filter-bar" title="Active Filter Bar">
            <div className="flex flex-wrap items-center gap-2">
              <div className={activeFilterPillClassName()}>
                <span className={activeFilterPillBodyClassName()}>Output: Note, CC</span>
                <button
                  type="button"
                  className={activeFilterPillClearClassName()}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <X size={14} weight="regular" />
                </button>
              </div>
              <div className={activeFilterPillClassName()}>
                <span className={activeFilterPillBodyClassName()}>
                  Status: On Quray, Modified +1
                </span>
                <button
                  type="button"
                  className={activeFilterPillClearClassName()}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <X size={14} weight="regular" />
                </button>
              </div>
              <div className={activeFilterPillClassName()}>
                <span className={activeFilterPillBodyClassName()}>
                  Device: Moog Subsequent 37 +2
                </span>
                <button
                  type="button"
                  className={activeFilterPillClearClassName()}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <X size={14} weight="regular" />
                </button>
              </div>
              <button
                type="button"
                className={activeFilterBarClearAllClassName()}
                tabIndex={-1}
              >
                Clear all
              </button>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              One pill per filter group showing selected values (70% opacity, full on body
              hover) · click pill body to re-open dropdown · X clears entire group (red on
              hover) · Clear all ml-4, red on hover.
            </p>
          </Section>

          <Section id="view-toggle" title="View Toggle">
            <StyleguideViewToggleDemo />
            <p className="mt-6 text-sm font-light text-text-muted">
              Segmented control · 48px outer rounded-lg · 6px padding · gap-1 between
              segments · active segment bg-accent rounded-md (4px) · inactive hover
              bg-hover · + New set text link (text-secondary, text-base, medium) appears to
              the right when Sets is active.
            </p>
          </Section>

          <Section id="bulk-selection" title="Bulk Selection">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Toolbar row (toggle + bulk actions)
                </p>
                <div className={presetListToolbarClassName()}>
                  <LibraryViewToggle value="presets" onChange={() => undefined} />
                  <BulkActionBar
                    selectedCount={3}
                    totalCount={12}
                    onSelectAll={() => undefined}
                    onClear={() => undefined}
                    onSendToQuray={() => undefined}
                    onExport={() => undefined}
                  />
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Column header checkbox
                </p>
                <StyleguideWidePreview>
                  <div className={PRESET_TABLE_HEADER}>
                    <div className={presetRowNameWithCheckboxClassName()}>
                      <PresetTableSelectAllCheckbox
                        selectedCount={2}
                        totalCount={5}
                        onSelectAll={() => undefined}
                        onClearSelection={() => undefined}
                      />
                      <PresetTableSortHeader
                        label="Name"
                        sortKey="name"
                        activeSortKey="name"
                        onSort={() => undefined}
                      />
                    </div>
                    <span aria-hidden="true" />
                    <span>Output</span>
                    <span>Zones</span>
                    <span>Last updated</span>
                    <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
                    <span aria-hidden="true" />
                  </div>
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Tri-state: unchecked · indeterminate (some selected) · checked (all selected).
                  Click from unchecked/indeterminate selects all; from checked clears all.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Row at rest (checkbox space reserved, hidden until hover)
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={PRESETS[0].isFavourite}
                    onToggleFavourite={() => undefined}
                    bulkSelectionEnabled
                    bulkActive={false}
                    isSelected={false}
                    onToggleSelect={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Bulk active (all checkboxes visible)
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={PRESETS[0].isFavourite}
                    onToggleFavourite={() => undefined}
                    bulkSelectionEnabled
                    bulkActive
                    isSelected
                    onToggleSelect={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              My Library only · reserved column: 16px + 16px checkbox + 12px gap before name ·
              names never shift · hover reveals row checkbox · once any item is selected all
              checkboxes stay visible until cleared · bulk bar unchanged.
            </p>
          </Section>

          <Section id="preset-row" title="Preset Row">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Table headers
                </p>
                <StyleguideWidePreview>
                  <div className={PRESET_TABLE_HEADER}>
                    <div className={presetRowNameWithCheckboxClassName()}>
                      <PresetTableSelectAllCheckbox
                        selectedCount={0}
                        totalCount={12}
                        onSelectAll={() => undefined}
                        onClearSelection={() => undefined}
                      />
                      <PresetTableSortHeader
                        label="Name"
                        sortKey="name"
                        activeSortKey="lastUpdated"
                        onSort={() => undefined}
                      />
                    </div>
                    <span aria-hidden="true" />
                    <span>Output</span>
                    <PresetTableSortHeader
                      label="Zones"
                      sortKey="zones"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <PresetTableSortHeader
                      label="Last updated"
                      sortKey="lastUpdated"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
                    <span aria-hidden="true" />
                  </div>
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Sortable columns use sort-icon.svg (currentColor) · 8px gap between label
                  and icon · active column highlighted · Status/Output not sortable.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Default
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={PRESETS[0].isFavourite}
                    onToggleFavourite={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Without Zones (Sets inner rows)
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={false}
                    onToggleFavourite={() => undefined}
                    showZones={false}
                    showFavourite={false}
                    dragHandle
                  />
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  `showZones={false}` · `showFavourite={false}` · dnd-kit drag handle ·
                  placeholder opacity while dragging.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Drag placeholder
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={false}
                    onToggleFavourite={() => undefined}
                    showZones={false}
                    showFavourite={false}
                    dragHandle
                    isDragPlaceholder
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Explore variant
                </p>
                <StyleguideWidePreview>
                  <div className={PRESET_TABLE_HEADER_EXPLORE}>
                    <PresetTableSortHeader
                      label="Name"
                      sortKey="name"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <span>Output</span>
                    <PresetTableSortHeader
                      label="Zones"
                      sortKey="zones"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <PresetTableSortHeader
                      label="Last updated"
                      sortKey="lastUpdated"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <span aria-hidden="true" />
                  </div>
                  <div className="mt-2">
                    <PresetRow
                      preset={EXPLORE_PRESETS[0]}
                      variant="explore"
                      isFavourite={EXPLORE_PRESETS[0].isFavourite}
                      onToggleFavourite={() => undefined}
                    />
                  </div>
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Tags sub-line · no Status column · no bulk checkbox · row click adds to
                  library · kebab: Add to library, Open in editor, Export.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Hover (actions visible)
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[2]}
                    isFavourite={PRESETS[2].isFavourite}
                    onToggleFavourite={() => undefined}
                    forceHover
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Sync status variants
                </p>
                <StyleguideWidePreview>
                  <div className="flex flex-col gap-2">
                    <PresetRow
                      preset={{ ...PRESETS[0], syncStatus: 'on-quray' }}
                      isFavourite={false}
                      onToggleFavourite={() => undefined}
                    />
                    <PresetRow
                      preset={{ ...PRESETS[1], syncStatus: 'modified' }}
                      isFavourite={false}
                      onToggleFavourite={() => undefined}
                    />
                    <PresetRow
                      preset={{ ...PRESETS[3], syncStatus: 'not-synced' }}
                      isFavourite={false}
                      onToggleFavourite={() => undefined}
                    />
                  </div>
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Inline rename (kebab → Rename)
                </p>
                <StyleguideWidePreview>
                  <PresetRow
                    preset={PRESETS[0]}
                    isFavourite={PRESETS[0].isFavourite}
                    onToggleFavourite={() => undefined}
                    isRenaming
                    onRenameSave={() => undefined}
                    onRenameCancel={() => undefined}
                  />
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Name becomes an inline input · pre-filled and selected · Enter or blur saves ·
                  Escape cancels · empty → Untitled N · duplicate names auto-suffixed with toast
                  · row click disabled while editing.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Action tooltips
                </p>
                <div className="flex flex-wrap items-center gap-8">
                  <Tooltip
                    content="Add to favourites"
                    className={presetRowActionTooltipClassName}
                  >
                    <button
                      type="button"
                      className={presetRowFavouriteButtonClassName()}
                      aria-label="Add to favourites"
                    >
                      <Star size={18} weight="regular" aria-hidden="true" />
                    </button>
                  </Tooltip>
                  <Tooltip
                    content="Remove from favourites"
                    className={presetRowActionTooltipClassName}
                  >
                    <button
                      type="button"
                      className={presetRowFavouriteButtonClassName()}
                      aria-label="Remove from favourites"
                    >
                      <Star size={18} weight="fill" aria-hidden="true" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Open in editor" className={presetRowActionTooltipClassName}>
                    <button
                      type="button"
                      className={presetRowActionButtonClassName()}
                      aria-label="Open in editor"
                    >
                      <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="flex flex-wrap items-start gap-10">
                <StyleguidePresetKebabMenuPanel
                  title="Explore kebab menu"
                  presetId="styleguide-explore"
                  variant="explore"
                />
                <StyleguidePresetKebabMenuPanel
                  title="Kebab menu"
                  presetId="styleguide"
                />
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Interactive
                </p>
                <div className="inline-flex items-center rounded-lg border border-border bg-bg-active px-4 py-3">
                  <PresetKebabMenu presetId="styleguide" />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Click kebab to open · portal-anchored dropdown · flips upward near viewport
                  bottom · same positioning as Library rows.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Badges
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <OutputChip label={formatOutputLabel('MIDI Note')} />
                  <OutputChip label={formatOutputLabel('MIDI CC')} />
                  <OutputChip label={formatOutputLabel('CV')} />
                  <ZoneBadge count={6} />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  bg-chip (#2E2F43) fill · py-1 px-3 · 14px font-light at 70% opacity · no
                  border
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Lightness ladder on row/actions · status icon chips vertically centered in row ·
              star/open tooltips above icons (centered, font-light muted text) · kebab
              Duplicate/Rename (inline edit, no modal) · row is clickable except during rename.
            </p>
          </Section>

          <Section id="fan-visualization" title="Fan Visualization">
            <div>
              <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                Quray sensor field · zone sectors
              </p>
              <StyleguideWidePreview>
                <div className="max-w-[360px] overflow-hidden rounded-lg border border-border bg-bg-surface">
                  <FanVisualization zones={PRESETS[0].zones} />
                </div>
              </StyleguideWidePreview>
              <p className="mt-4 text-sm font-light text-text-muted">
                SVG viewBox 0 0 360 220 · pt-6 top padding · 140° fan arc from bottom-center ·
                bg-elevated background
                ring with border stroke · zone colors at 80% opacity · 1px bg-base separators.
              </p>
            </div>
          </Section>

          <Section id="preset-detail-panel" title="Preset Detail Panel">
            <div>
              <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                Fan · name · metadata · accordion · pinned footer
              </p>
              <StyleguideWidePreview>
                <div className="flex h-[32rem] justify-end overflow-hidden rounded-lg border border-border">
                  <PresetDetailPanel
                    preset={PRESETS[0]}
                    memberSets={getSetsContainingPreset(SETS, PRESETS[0].id)}
                    isFavourite={PRESETS[0].isFavourite}
                    onToggleFavourite={() => undefined}
                    onClose={() => undefined}
                    onOpenInEditor={() => undefined}
                    onSendToQuray={() => undefined}
                    onNavigateToSet={() => undefined}
                    onDuplicate={() => undefined}
                    onRename={() => undefined}
                    onAddToSet={() => undefined}
                    onExport={() => undefined}
                    onDelete={() => undefined}
                  />
                </div>
              </StyleguideWidePreview>
              <p className="mt-4 text-sm font-light text-text-muted">
                360px column · close (absolute top-right) · fan visualization · star + name row ·
                metadata grid with labeled status row · collapsed zones accordion · in-sets rows ·
                pinned footer with Open in editor, Send to Quray, and icon actions.
              </p>
            </div>
          </Section>

          <Section id="set-row" title="Set Row">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Table headers (Sets view)
                </p>
                <StyleguideWidePreview>
                  <div className={PRESET_TABLE_HEADER_SETS}>
                    <div className={presetRowNameWithCheckboxClassName()}>
                      <PresetTableSelectAllCheckbox
                        selectedCount={0}
                        totalCount={4}
                        onSelectAll={() => undefined}
                        onClearSelection={() => undefined}
                      />
                      <span>Name</span>
                    </div>
                    <span aria-hidden="true" />
                    <span aria-hidden="true" className={PRESET_TABLE_ZONES_CELL_LIBRARY} />
                    <span>Last updated</span>
                    <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
                    <span aria-hidden="true" />
                  </div>
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Three data columns — Name, Last updated, Status (aggregated from members) · no
                  Output or Zones.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Collapsed
                </p>
                <StyleguideWidePreview>
                  <SetRow
                    set={SETS[0]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded={false}
                    onToggleExpand={() => undefined}
                    isFavourite={false}
                    onToggleFavourite={() => undefined}
                    bulkSelectionEnabled
                    bulkActive
                    isSelected
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Expanded
                </p>
                <StyleguideWidePreview>
                  <SetRow
                    set={SETS[1]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded
                    onToggleExpand={() => undefined}
                    isFavourite={false}
                    onToggleFavourite={() => undefined}
                    forceHover
                  />
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Inner rows use nested PresetRow (bare, no card) with showZones=false, no star,
                  Remove from set / Move to set / Open in editor kebab, @dnd-kit sortable with
                  DragOverlay and placeholder dimming.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Inline rename
                </p>
                <StyleguideWidePreview>
                  <SetRow
                    set={SETS[0]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded={false}
                    onToggleExpand={() => undefined}
                    isFavourite={false}
                    onToggleFavourite={() => undefined}
                    isRenaming
                    onRenameSave={() => undefined}
                    onRenameCancel={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div className="flex flex-wrap items-start gap-10">
                <StyleguideSetKebabMenuPanel title="Kebab menu" setId="styleguide-set" />
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Interactive
                </p>
                <div className="inline-flex items-center rounded-lg border border-border bg-bg-active px-4 py-3">
                  <SetKebabMenu setId="styleguide-set" />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Click kebab to open · portal-anchored dropdown · flips upward near viewport bottom.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Mirrors PresetRow grid (4 columns) · expand caret after set name · bulk
              checkbox in left slot · star on set rows only · set status aggregated from member
              sync states · inner presets show per-member status, not global · bare rows with
              dividers, drag-reorder · + Add preset opens Add Preset Picker.
            </p>
          </Section>

          <Section id="device-screen" title="Device Screen">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Status chips (on device)
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Tooltip content="On device">
                    <StatusChip status="current" />
                  </Tooltip>
                  <Tooltip content="Needs sync">
                    <StatusChip status="needs-sync" />
                  </Tooltip>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Bulk bar (selection active)
                </p>
                <StyleguideWidePreview>
                  <DeviceSectionHeader
                    bulkActive
                    selectedCount={2}
                    totalCount={5}
                    onSelectAll={() => undefined}
                    onClear={() => undefined}
                    onRemoveSelected={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Preset slot — drag handle + needs sync
                </p>
                <StyleguideWidePreview>
                  <DevicePresetSlotRow
                    preset={PRESETS[4]}
                    sequenceIndex={1}
                    deviceSyncStatus="needs-sync"
                    bulkActive={false}
                    isSelected={false}
                    forceHover
                    onEdit={() => undefined}
                    onRemove={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Set slot — bulk selected
                </p>
                <StyleguideWidePreview>
                  <DeviceSetSlotRow
                    set={SETS[1]}
                    sequenceIndex={0}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    devicePresetSyncById={
                      new Map(
                        Object.entries(DEVICE_PRESET_SYNC) as [string, 'current' | 'needs-sync'][],
                      )
                    }
                    deviceSyncStatus="needs-sync"
                    isExpanded={false}
                    bulkActive
                    isSelected
                    forceHover
                    onToggleExpand={() => undefined}
                    onEdit={() => undefined}
                    onRemove={() => undefined}
                    onEditInnerPreset={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Expanded set — nested inner presets
                </p>
                <StyleguideWidePreview>
                  <DeviceSetSlotRow
                    set={SETS[1]}
                    sequenceIndex={0}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    devicePresetSyncById={
                      new Map(
                        Object.entries(DEVICE_PRESET_SYNC) as [string, 'current' | 'needs-sync'][],
                      )
                    }
                    deviceSyncStatus="needs-sync"
                    isExpanded
                    bulkActive={false}
                    isSelected={false}
                    onToggleExpand={() => undefined}
                    onEdit={() => undefined}
                    onRemove={() => undefined}
                    onEditInnerPreset={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Inline slot actions
                </p>
                <div className="inline-flex items-center gap-6 rounded-lg border border-border bg-bg-active px-4 py-3">
                  <DeviceSlotActions
                    variant="set"
                    forceHover
                    onEdit={() => undefined}
                    onRemove={() => undefined}
                  />
                  <DeviceSlotActions
                    variant="preset"
                    forceHover
                    onEdit={() => undefined}
                    onRemove={() => undefined}
                  />
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              My Quray slot list · no column headers · light seq numbers (24px) anchor each row ·
              flat rows with dividers (no cards) · leading: checkbox → drag → seq →
              name · set slots show preset count + caret; preset slots single-line · expanded inner
              presets indented under parent name column · compact inner rows (py-3, text-sm names) with status
              aligned to parent set column · dnd-kit drag reorder · hover inline actions · bulk bar on selection only. Mock order:{' '}
              {DEVICE_WORKING_SET.length} interleaved slots.
            </p>
          </Section>

          <Section id="set-picker" title="Set Picker">
            <div className="space-y-6">
              <StyleguideSetPickerDemo />
              <p className="text-sm font-light text-text-muted">
                Centered command-palette modal · search filters sets by name · single-select list ·
                Create new set action at top · used by Presets-tab Add to set and inner-row Move to
                set (current set excluded).
              </p>
            </div>
          </Section>

          <Section id="add-preset-picker" title="Add Preset Picker">
            <div className="space-y-6">
              <StyleguideAddPresetPickerDemo />
              <p className="text-sm font-light text-text-muted">
                Centered command-palette modal · multi-select with checkboxes · presets already in
                the set shown checked and disabled with Already in set · Create new preset at top ·
                footer shows selection count and Add button.
              </p>
            </div>
          </Section>

          <Section id="nav-item" title="Nav Item">
            <div className="flex max-w-xs flex-col gap-6">
              <StyleguideNavDemo state="default" label="Default" />
              <StyleguideNavDemo state="active" label="Active" />
              <StyleguideNavDemo state="hover" label="Hover" />
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Sidebar navigation entry.
            </p>
          </Section>

          <Section id="preset-setup-row" title="Preset Setup Row">
            <div className="mx-auto w-[264px] space-y-6 rounded-lg border border-border-panel bg-bg-sidebar py-4">
              <p className="shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Preset setup
              </p>
              <div className="flex flex-col gap-2 px-4">
                <button type="button" className={`w-full ${PRESET_SETUP_ROW_CLASSNAME}`}>
                  <span
                    className="h-5 w-5 shrink-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #A259F7, #F24E8A)',
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-text-primary">Color</span>
                  </div>
                  <CaretRight size={16} className="ml-auto shrink-0 text-text-muted" />
                </button>
                <button type="button" className={`w-full ${PRESET_SETUP_ROW_CLASSNAME}`}>
                  <MusicNote size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-text-primary">Scale</span>
                    <span className="block text-xs text-text-muted">D Minor</span>
                  </div>
                  <CaretRight size={16} className="ml-auto shrink-0 text-text-muted" />
                </button>
                <button type="button" className={`w-full ${PRESET_SETUP_ROW_CLASSNAME}`}>
                  <SquaresFour size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-text-primary">Layout</span>
                    <span className="block text-xs text-text-muted">6 × 6 grid</span>
                  </div>
                  <CaretRight size={16} className="ml-auto shrink-0 text-text-muted" />
                </button>
              </div>
              <div className="flex flex-col gap-6 px-4 pt-2">
                <StyleguidePresetSetupRowDemo state="default" label="Default" />
                <StyleguidePresetSetupRowDemo state="hover" label="Hover" />
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Editor sidebar preset setup rows · matches NavItem active surface (
              <code className="font-mono text-xs text-text-secondary">bg-bg-active</code>,{' '}
              <code className="font-mono text-xs text-text-secondary">border-border-active</code>
              ) · rows sit in a <code className="font-mono text-xs text-text-secondary">px-4</code>{' '}
              wrapper · CaretRight uses <code className="font-mono text-xs text-text-secondary">ml-auto</code>.
            </p>
          </Section>

          <Section id="account-row" title="Account Row">
            <div className="flex flex-wrap items-start gap-8">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Logged in
                </p>
                <div className="w-[264px] overflow-visible rounded-lg border border-border-panel bg-bg-sidebar">
                  <AccountRow
                    isCollapsed={false}
                    onOpenDeviceSettings={() => undefined}
                  />
                </div>
                <p className="mt-4 max-w-xs text-sm font-light text-text-muted">
                  Click the kebab to open the account menu (opens upward). Device
                  settings opens the shared modal.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Guest
                </p>
                <div className="w-[264px] rounded-lg border border-border-panel bg-bg-sidebar">
                  <StyleguideGuestAccountRow />
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Account is optional on first run (demo works without sign-in); signing
              in protects presets from loss.
            </p>
          </Section>

          <Section id="fan-canvas" title="Fan Canvas">
            <div className="space-y-6">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Interactive editor canvas
                </p>
                <div className="h-[420px] overflow-hidden rounded-lg border border-border">
                  <StyleguideEditorLayoutDemo />
                </div>
              </div>

              <div className="space-y-3 text-sm font-light text-text-muted">
                <p>
                  <code className="font-mono text-xs text-text-secondary">FanCanvas</code> — HTML
                  canvas fan renderer for the editor. Draws the 96° sector grid, coloured zone
                  arc sectors, selection highlight, edge-resize, move, and drag-to-draw creation.
                </p>
                <p className="text-xs font-light uppercase tracking-wide text-text-primary">
                  Props
                </p>
                <ul className="list-inside list-disc space-y-1 font-mono text-xs text-text-secondary">
                  <li>zones: EditorZone[]</li>
                  <li>selectedZoneId: string | null</li>
                  <li>drawMode: boolean</li>
                  <li>onZoneSelect(id: string | null): void</li>
                  <li>onZoneCreate(position: GesturePosition): void</li>
                  <li>onZoneUpdate(id: string, position: GesturePosition): void</li>
                </ul>
                <p>
                  Visual: dark sector fill with angular/radial grid · mapped zones use zone colour
                  at 30% fill (70% when selected) · unmapped zones show grey hatch + amber warning
                  dot · selected zone has bright 2px outline · edge drag resizes (ew/ns cursors) ·
                  draw mode shows dashed ghost preview.
                </p>
              </div>
            </div>
          </Section>

          <Section id="zone-mapping-card" title="Zone Mapping Card">
            <StyleguideZoneMappingCardDemo />
            <div className="mt-6 space-y-3 text-sm font-light text-text-muted">
              <p>
                <code className="font-mono text-xs text-text-secondary">ZoneMappingCard</code> — accordion
                card for a single zone mapping (
                <code className="font-mono text-xs text-text-secondary">components/editor/ZoneMappingCard.tsx</code>
                ). Collapsed header shows summary text, caret, and delete action · expanded body
                renders type-specific fields · Note type exposes a Split zone toggle; when enabled
                shows distribution mode (Linear / Jump 2 / Jump 3 / Random), Steps stepper (2–12),
                and a live piano-roll preview strip of the resulting note names.
              </p>
              <p className="text-xs font-light uppercase tracking-wide text-text-primary">Props</p>
              <ul className="list-inside list-disc space-y-1 font-mono text-xs text-text-secondary">
                <li>mapping: ZoneMapping</li>
                <li>isOpen: boolean</li>
                <li>onToggle(): void</li>
                <li>onUpdate(patch: Partial&lt;ZoneMapping&gt;): void</li>
                <li>onTypeChange(type: ZoneMappingType): void</li>
                <li>onDelete(): void</li>
              </ul>
              <p>
                Card style: rounded-xl border border-border-active bg-bg-active · only one mapping
                accordion open at a time per zone in{' '}
                <code className="font-mono text-xs text-text-secondary">ZoneSettings</code>.
              </p>
            </div>
          </Section>

          <Section id="zone-settings" title="Zone Settings">
            <div className="flex flex-wrap items-start gap-8">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Empty state
                </p>
                <div
                  className="flex h-48 w-80 flex-col overflow-hidden rounded-lg border border-border-panel"
                  style={{ background: 'var(--color-bg-sidebar)' }}
                >
                  <StyleguideZoneSettingsDemo
                    selectedZoneId={null}
                    initialZones={STYLEGUIDE_EDITOR_ZONES}
                  />
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Zone selected
                </p>
                <div
                  className="flex h-[640px] w-80 flex-col overflow-hidden rounded-lg border border-border-panel"
                  style={{ background: 'var(--color-bg-sidebar)' }}
                >
                  <StyleguideZoneSettingsDemo
                    selectedZoneId="sg-z1"
                    initialZones={STYLEGUIDE_EDITOR_ZONES}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm font-light text-text-muted">
              <p>
                <code className="font-mono text-xs text-text-secondary">ZoneSettings</code> — right
                panel in the editor (
                <code className="font-mono text-xs text-text-secondary">components/editor/ZoneSettings.tsx</code>
                ). 320px (
                <code className="font-mono text-xs text-text-secondary">w-80</code>) sidebar with
                bg-sidebar and border-panel left edge · scrolls when content overflows.
              </p>
              <p className="text-xs font-light uppercase tracking-wide text-text-primary">Props</p>
              <ul className="list-inside list-disc space-y-1 font-mono text-xs text-text-secondary">
                <li>selectedZoneId: string | null</li>
                <li>zones: EditorZone[]</li>
                <li>onZonePatch(id, {'{'} name, color, type, active, locked {'}'})</li>
              </ul>
              <p>
                Sections: header (editable name, color picker, Active/Lock toggles) · MAPPINGS
                accordion list with add/delete (undo toast via editor context) · each mapping card
                holds type, channel, and type-specific fields including axis where applicable.
              </p>
            </div>
          </Section>

          <Section id="editor-layout" title="Editor Layout">
            <StyleguideEditorLayoutDemo />
            <p className="mt-6 text-sm font-light text-text-muted">
              <code className="font-mono text-xs text-text-secondary">Editor.tsx</code> page shell
              inside AppShell · left zone list lives in{' '}
              <code className="font-mono text-xs text-text-secondary">Sidebar.tsx</code> when route
              is <code className="font-mono text-xs text-text-secondary">/editor</code> · main
              content is flex row:{' '}
              <code className="font-mono text-xs text-text-secondary">FanCanvas</code> (
              <code className="font-mono text-xs text-text-secondary">flex-1 min-w-0 h-full</code>
              ) + <code className="font-mono text-xs text-text-secondary">ZoneSettings</code> (
              <code className="font-mono text-xs text-text-secondary">w-80 shrink-0</code>). No
              toolbar or duplicate zone list in the page body.
            </p>
          </Section>

          <Section id="fan-geometry" title="Fan Geometry">
            <div className="space-y-6 text-sm font-light text-text-muted">
              <p>
                Pure geometry utilities in{' '}
                <code className="font-mono text-xs text-text-secondary">src/utils/fanGeometry.ts</code>.
                Ported from gesture-canvas.js — no DOM, no side effects. Used by{' '}
                <code className="font-mono text-xs text-text-secondary">FanCanvas</code>.
              </p>

              <div>
                <p className="mb-2 text-xs font-light uppercase tracking-wide text-text-muted">
                  Coordinate system
                </p>
                <p>
                  Logical space: x and y both 0–1. x is angular (left → right across the 96° fan).
                  y is radial (0 = inner arc, 1 = outer arc). Canvas space uses CSS pixels; DPR
                  scaling is handled outside these functions.
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-light uppercase tracking-wide text-text-muted">
                  Exports
                </p>
                <ul className="space-y-2 font-mono text-xs text-text-secondary">
                  <li>
                    sectorForCanvas(canvas: {'{'} width, height {'}'}) → SectorGeometry — fan
                    centre, radii, start/end angles for a canvas size
                  </li>
                  <li>logicalToCanvas(lx, ly, S) → {'{'} x, y {'}'} — logical → canvas px</li>
                  <li>canvasToLogical(px, py, S) → {'{'} x, y {'}'} — canvas px → logical</li>
                  <li>
                    sectorRectPath(ctx, S, xMin, yMin, xMax, yMax) — trace arc-sector path for a
                    zone bounding box
                  </li>
                  <li>clamp(value, min, max) → number</li>
                  <li>isInsideFan(lx, ly) → boolean — true when x and y are in 0–1</li>
                </ul>
              </div>

              <p>
                Visual: fan originates from below the canvas bottom edge · 96° total opening · inner
                radius clamped to at least 15% of outer radius on tall canvases · zone rectangles
                map to arc sectors via the logical bounding box.
              </p>
            </div>
          </Section>

          <Section id="device-page" title="Device Page">
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Page chrome (toolbar + status + slot list)
                </p>
                <StyleguideDevicePageDemo />
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Toast (undo action)
                </p>
                <div className="relative h-24 overflow-hidden rounded-lg border border-border bg-bg-base">
                  <Toast
                    message="Removed Bassline Filter Sweep from Quray."
                    actionLabel="Undo"
                    onAction={() => undefined}
                    onDismiss={() => undefined}
                    durationMs={60000}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm font-light text-text-muted">
              <p>
                <code className="font-mono text-xs text-text-secondary">Device.tsx</code> composes
                the My Quray screen: hero-glow header with toolbar and status, then the working-set
                slot list. Slot row components are documented in Device Screen above.
              </p>
              <p className="text-xs font-light uppercase tracking-wide text-text-primary">Components</p>
              <ul className="list-inside list-disc space-y-1 font-mono text-xs text-text-secondary">
                <li>
                  DeviceToolbar — hasStagedChanges, arrangementChangeCount, updateCount,
                  onUpdateQuray
                </li>
                <li>
                  DeviceStatusBlock — status: {'{'} usedMb, totalMb, firmwareVersion {'}'}
                </li>
                <li>
                  DeviceWorkingSetList — slots, sets, presets, presetSync, selection + reorder
                  callbacks
                </li>
                <li>
                  Toast — message, onDismiss, optional actionLabel + onAction (slot removal undo)
                </li>
              </ul>
              <p>
                Visual: same hero-glow cap as Library · “My Quray” title with staged-changes label
                and Update Quray button · capacity bar + firmware readout · flat interleaved preset/set
                rows with dnd-kit reorder.
              </p>
            </div>
          </Section>

          <Section id="process-notes" title="Process Notes">
            <div className="space-y-10">
              <div>
                <h3 className="mb-3 text-sm font-medium text-text-secondary">
                  Preset list scaling (prototype vs production)
                </h3>
                <p className="text-sm font-light leading-relaxed text-text-muted">
                  The My Library preset list is a simple scrollable list — every row mounts in
                  the DOM. That is appropriate for mock data and UX prototyping. In production,
                  the preset library is unlimited in size: use list virtualization (e.g.{' '}
                  <code className="font-mono text-xs text-text-secondary">
                    @tanstack/react-virtual
                  </code>
                  ) so only visible rows render. Filtering, sorting, and bulk selection should
                  operate on the full dataset while the viewport renders a window of rows. See{' '}
                  <code className="font-mono text-xs text-text-secondary">docs/process-notes.md</code>
                  .
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-text-secondary">
                  Library layout spacing
                </h3>
                <p className="mb-6 text-sm font-light leading-relaxed text-text-muted">
                  Normal scrolling (no sticky chrome). Hero glow ends{' '}
                  <code className="font-mono text-xs text-text-secondary">32px</code> below the
                  search/filters row, then flat{' '}
                  <code className="font-mono text-xs text-text-secondary">bg-bg-base</code>. Toggle
                  and table spacing:{' '}
                  <code className="font-mono text-xs text-text-secondary">32px</code> above toggle
                  (via glow cap, or <code className="font-mono text-xs text-text-secondary">pt-8</code>{' '}
                  when pills visible),{' '}
                  <code className="font-mono text-xs text-text-secondary">32px</code> below toggle
                  to column headers,{' '}
                  <code className="font-mono text-xs text-text-secondary">20px</code> from headers
                  to first row.
                </p>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Preset list chrome
                </p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className={presetListToolbarClassName()}>
                    <LibraryViewToggle value="presets" onChange={() => undefined} />
                    <BulkActionBar
                      selectedCount={2}
                      totalCount={12}
                      onSelectAll={() => undefined}
                      onClear={() => undefined}
                      onSendToQuray={() => undefined}
                      onExport={() => undefined}
                    />
                  </div>
                  <div className={presetListTableHeaderClassName()}>
                    <div className={PRESET_TABLE_HEADER}>
                      <div className={presetRowNameWithCheckboxClassName()}>
                        <PresetTableSelectAllCheckbox
                          selectedCount={2}
                          totalCount={12}
                          onSelectAll={() => undefined}
                          onClearSelection={() => undefined}
                        />
                        <span>Name</span>
                      </div>
                      <span aria-hidden="true" />
                      <span>Output</span>
                      <span>Zones</span>
                      <span>Last updated</span>
                      <span className={PRESET_TABLE_STATUS_HEADER_CELL}>Status</span>
                      <span aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}

function TypographyRow({ token, className }: { token: string; className: string }) {
  const [px, setPx] = useState('')

  useEffect(() => {
    const fromVar = resolveCssValue(token)
    if (fromVar) {
      setPx(fromVar)
      return
    }
    const probe = document.createElement('span')
    probe.className = `${className} invisible absolute`
    probe.textContent = 'M'
    document.body.appendChild(probe)
    const size = getComputedStyle(probe).fontSize
    document.body.removeChild(probe)
    setPx(size)
  }, [token, className])

  return (
    <div className="flex flex-col gap-1 border-b border-border/50 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-8">
      <p className={`min-w-0 flex-1 ${className} text-text-primary`}>
        The quick brown fox jumps over the lazy dog.
      </p>
      <p className="shrink-0 font-mono text-xs text-text-muted">
        {token}
        {px ? ` · ${px}` : ''}
      </p>
    </div>
  )
}

function RadiusDemo({
  demo,
}: {
  demo: (typeof RADIUS_DEMOS)[number]
}) {
  const [resolved, setResolved] = useState('')

  useEffect(() => {
    if ('token' in demo) {
      const val = resolveCssValue(demo.token)
      setResolved(val || demo.fallback)
    } else {
      setResolved(demo.px)
    }
  }, [demo])

  const label = 'token' in demo ? demo.token : demo.label
  const className = 'className' in demo ? demo.className : ''

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`h-16 w-16 border border-border bg-bg-active ${className}`}
        style={'token' in demo && resolved ? { borderRadius: `var(${demo.token}, ${demo.fallback})` } : undefined}
      />
      <div>
        <p className="font-mono text-xs text-text-primary">{label}</p>
        {resolved && <p className="mt-1 text-xs text-text-muted">{resolved}</p>}
      </div>
    </div>
  )
}
