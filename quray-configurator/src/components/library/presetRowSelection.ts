/** 16px gap between checkbox (in pl-4 slot on row/header) and name content. */
export function presetRowNameWithCheckboxClassName() {
  return 'flex min-w-0 items-center gap-4'
}

/** Row body: align checkbox to name line only (subline sits below). */
export function presetRowNameWithCheckboxRowClassName() {
  return 'flex min-w-0 items-start gap-4'
}

export function presetRowCheckboxSlotClassName() {
  return 'shrink-0'
}

/** Centers 16px checkbox on text-lg leading-none name line (18px). */
export function presetRowCheckboxNameAlignClassName() {
  return 'mt-px'
}

export function presetRowCheckboxVisibilityClassName(bulkActive: boolean) {
  if (bulkActive) {
    return 'pointer-events-auto opacity-100 transition-opacity duration-[120ms]'
  }

  return 'pointer-events-none opacity-0 transition-opacity duration-[120ms] group-hover:pointer-events-auto group-hover:opacity-100'
}
