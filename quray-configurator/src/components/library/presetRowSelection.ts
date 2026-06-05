/** Checkbox hit target (w-7) + 12px gap to preset name column. */
export const PRESET_ROW_NAME_SHIFT_CLASS = 'translate-x-[40px]'

export function presetRowNameColumnClassName(bulkActive: boolean) {
  if (bulkActive) {
    return `transition-transform duration-[120ms] ${PRESET_ROW_NAME_SHIFT_CLASS}`
  }

  return 'translate-x-0 transition-transform duration-[120ms] group-hover:translate-x-[40px]'
}

export function presetRowCheckboxVisibilityClassName(bulkActive: boolean) {
  return bulkActive
    ? 'pointer-events-auto opacity-100 transition-opacity duration-[120ms]'
    : 'pointer-events-none opacity-0 transition-opacity duration-[120ms] group-hover:pointer-events-auto group-hover:opacity-100'
}
