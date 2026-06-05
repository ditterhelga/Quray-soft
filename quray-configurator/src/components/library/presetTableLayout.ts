export const PRESET_TABLE_GRID =
  'grid grid-cols-[minmax(280px,1fr)_80px_140px_80px_120px_140px] items-center gap-x-6'

export const PRESET_TABLE_GRID_EXPLORE =
  'grid grid-cols-[minmax(280px,1fr)_140px_80px_120px_140px] items-center gap-x-6'

export const PRESET_TABLE_HEADER =
  `${PRESET_TABLE_GRID} px-6 text-sm font-light text-text-muted`

export const PRESET_TABLE_HEADER_EXPLORE =
  `${PRESET_TABLE_GRID_EXPLORE} px-6 text-sm font-light text-text-muted`

export const PRESET_TABLE_ACTIONS_CELL = 'flex items-center justify-end gap-3'

export const PRESET_TABLE_STATUS_CELL =
  'flex items-center justify-start place-self-center'

/** Columns + gaps + row horizontal padding — use for full-width preset row previews. */
export const PRESET_TABLE_MIN_WIDTH_CLASS = 'min-w-[63rem]'
