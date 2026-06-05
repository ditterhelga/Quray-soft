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

export function OutputChip({ label }: { label: string }) {
  return <span className={outputChipClassName()}>{label}</span>
}

export function ZoneBadge({ count }: { count: number }) {
  return <span className={zoneBadgeClassName()}>{count}</span>
}

export function formatOutputLabel(outputType: OutputType) {
  return OUTPUT_LABELS[outputType]
}
