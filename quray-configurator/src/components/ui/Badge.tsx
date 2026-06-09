import type { OutputType } from '@/types'

const OUTPUT_LABELS: Record<OutputType, string> = {
  'MIDI Note': 'Note',
  'MIDI CC': 'CC',
  CV: 'CV',
}

function chipBaseClassName() {
  return 'inline-flex items-center rounded-sm bg-bg-chip px-3 py-1 text-sm font-light text-text-primary opacity-70'
}

export function outputChipClassName() {
  return chipBaseClassName()
}

export function zoneBadgeClassName() {
  return `${chipBaseClassName()} font-mono [font-weight:300]`
}

export function tagChipClassName() {
  return 'inline-flex items-center rounded-sm bg-bg-chip px-2 py-0.5 text-xs font-light text-text-primary opacity-70'
}

export function compactOutputChipClassName() {
  return 'inline-flex items-center rounded-sm bg-bg-chip px-2 py-0.5 text-xs font-light text-text-primary opacity-70'
}

export function TagChip({ label }: { label: string }) {
  return <span className={tagChipClassName()}>{label}</span>
}

export function CompactOutputChip({ label }: { label: string }) {
  return <span className={compactOutputChipClassName()}>{label}</span>
}

export function OutputChip({ label }: { label: string }) {
  return <span className={outputChipClassName()}>{label}</span>
}

export function ZoneBadge({ count }: { count: number }) {
  return <span className={zoneBadgeClassName()}>{count}</span>
}

export function formatOutputLabel(outputType: OutputType) {
  return OUTPUT_LABELS[outputType]
}
