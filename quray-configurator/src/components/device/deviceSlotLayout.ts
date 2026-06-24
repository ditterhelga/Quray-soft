export function deviceSlotRowClassName(isDragPlaceholder = false) {
  return `group relative rounded-lg border border-border bg-bg-active py-6 pr-6 transition-colors duration-[120ms] ${
    isDragPlaceholder ? 'opacity-40' : ''
  }`.trim()
}

export function deviceSlotListRowsClassName() {
  return 'flex flex-col gap-2'
}

export function deviceSlotLeadingClassName() {
  return 'flex min-w-0 shrink-0 items-center pl-4'
}

export function deviceSlotLeadingGapClassName() {
  return 'ml-3'
}

export function deviceSlotSequenceClassName() {
  return 'w-10 shrink-0 text-center font-mono text-[24px] font-light tabular-nums leading-none text-text-secondary'
}

export function deviceSlotDragHandleClassName() {
  return 'flex h-4 w-4 shrink-0 cursor-grab touch-none items-center justify-center self-center bg-transparent text-text-muted active:cursor-grabbing'
}

export function deviceSlotInnerRowSpacerClassName() {
  return 'w-[7.75rem] shrink-0'
}

export function deviceInnerPresetRowClassName() {
  return 'group bg-transparent pr-6 transition-colors duration-[120ms]'
}

export function deviceInnerPresetRowContentClassName(showDivider: boolean) {
  return `min-w-0 flex-1 py-3 ${showDivider ? 'border-t border-border' : ''}`
}

export function deviceSetExpandedGroupClassName() {
  return 'mt-2'
}

export function deviceSetExpandedPresetsClassName() {
  return 'flex flex-col'
}

export function formatDeviceSlotSequence(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function deviceSlotDragOverlayClassName() {
  return 'bg-bg-base shadow-lg'
}
