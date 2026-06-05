import { useEffect, useState, type ReactNode } from 'react'
import { ArrowSquareOut, CaretDown, Plus, Star, X } from '@phosphor-icons/react'
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
import { BulkActionBar } from '@/components/library/BulkActionBar'
import { PresetKebabMenu } from '@/components/library/PresetKebabMenu'
import { SetKebabMenu } from '@/components/library/SetKebabMenu'
import { SetRow } from '@/components/library/SetRow'
import {
  presetListTableHeaderClassName,
  presetListToolbarClassName,
} from '@/components/library/libraryLayout'
import { PresetRow } from '@/components/library/PresetRow'
import {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowFavouriteButtonClassName,
} from '@/components/library/presetRowActions'
import { PresetTableSortHeader } from '@/components/library/PresetTableSortHeader'
import { PRESET_TABLE_HEADER, PRESET_TABLE_HEADER_EXPLORE, PRESET_TABLE_MIN_WIDTH_CLASS } from '@/components/library/presetTableLayout'
import { PRESETS } from '@/data/presets'
import { EXPLORE_PRESETS } from '@/data/explorePresets'
import { SETS } from '@/data/sets'
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
import { tabClassName, tabGroupClassName } from '@/components/ui/Tab'
import {
  StatusChip,
  SYNC_STATUS_META,
  getSyncStatusLabel,
} from '@/components/ui/StatusChip'
import { Tooltip } from '@/components/ui/Tooltip'
import { StatusPill } from '@/components/ui/StatusPill'
import type { SyncStatus } from '@/types'

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
      { id: 'set-row', label: 'Set Row' },
      { id: 'nav-item', label: 'Nav Item' },
      { id: 'account-row', label: 'Account Row' },
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
        view="presets"
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
        <span className="text-xs text-text-muted">Sets active</span>
        <LibraryViewToggle value="sets" onChange={() => undefined} />
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
              bg-hover.
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
                  Row with checkbox visible (bulk active)
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
              My Library only · hover reveals checkbox + 12px gap to name column · selecting
              one reveals all checkboxes · name and device lines shift together · bulk bar
              right cluster: count · Select all · Clear · Export · Send to Quray.
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
                    <PresetTableSortHeader
                      label="Name"
                      sortKey="name"
                      activeSortKey="lastUpdated"
                      onSort={() => undefined}
                    />
                    <span>Status</span>
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

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Explore kebab menu
                </p>
                <div className="inline-flex items-center rounded-lg border border-border bg-bg-active px-4 py-3">
                  <PresetKebabMenu presetId="styleguide-explore" variant="explore" forceOpen />
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Kebab menu
                </p>
                <div className="inline-flex items-center rounded-lg border border-border bg-bg-active px-4 py-3">
                  <PresetKebabMenu presetId="styleguide" forceOpen />
                </div>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Portal-anchored dropdown · opens below the kebab button · flips upward near
                  viewport bottom · same positioning as Library rows.
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

          <Section id="set-row" title="Set Row">
            <div className="space-y-10">
              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Collapsed
                </p>
                <StyleguideWidePreview className="max-w-5xl">
                  <SetRow
                    set={SETS[0]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded={false}
                    onToggleExpand={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Expanded
                </p>
                <StyleguideWidePreview className="max-w-5xl">
                  <SetRow
                    set={SETS[1]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded
                    onToggleExpand={() => undefined}
                    forceHover
                  />
                </StyleguideWidePreview>
                <p className="mt-4 text-sm font-light text-text-muted">
                  Ordered preset slots with position, drag handle (visual only), sync dot, and
                  Add preset action.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Inline rename
                </p>
                <StyleguideWidePreview className="max-w-5xl">
                  <SetRow
                    set={SETS[0]}
                    presetsById={new Map(PRESETS.map((preset) => [preset.id, preset]))}
                    isExpanded={false}
                    onToggleExpand={() => undefined}
                    isRenaming
                    onRenameSave={() => undefined}
                    onRenameCancel={() => undefined}
                  />
                </StyleguideWidePreview>
              </div>

              <div>
                <p className="mb-4 text-xs font-light uppercase tracking-wide text-text-muted">
                  Kebab menu
                </p>
                <div className="inline-flex items-center rounded-lg border border-border bg-bg-active px-4 py-3">
                  <SetKebabMenu setId="styleguide-set" forceOpen />
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm font-light text-text-muted">
              Row click toggles accordion · status chip + relative time on the right · open
              editor icon on hover · no bulk selection.
            </p>
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
                      <span>Name</span>
                      <span>Status</span>
                      <span>Output</span>
                      <span>Zones</span>
                      <span>Last updated</span>
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
