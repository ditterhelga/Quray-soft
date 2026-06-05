export const PRESET_TABLE_GRID =
  'grid grid-cols-[minmax(280px,1fr)_80px_32px_200px_80px_128px_140px] items-center gap-x-8'

export const PRESET_TABLE_GRID_SETS =
  'grid grid-cols-[minmax(280px,1fr)_80px_128px_140px] items-center gap-x-8'

export const PRESET_TABLE_GRID_EXPLORE =
  'grid grid-cols-[minmax(280px,1fr)_200px_80px_128px_140px] items-center gap-x-8'

export const PRESET_TABLE_HEADER =
  `${PRESET_TABLE_GRID} px-6 text-sm font-light text-text-muted`

export const PRESET_TABLE_HEADER_SETS =
  `${PRESET_TABLE_GRID_SETS} px-6 text-sm font-light text-text-muted`

export const PRESET_TABLE_HEADER_EXPLORE =
  `${PRESET_TABLE_GRID_EXPLORE} px-6 text-sm font-light text-text-muted`

export const PRESET_TABLE_ACTIONS_CELL = 'flex items-center justify-end gap-3'

export const PRESET_TABLE_OUTPUT_CELL = 'flex flex-nowrap items-center gap-1'

export const PRESET_TABLE_STATUS_HEADER_CELL = 'text-center'

export const PRESET_TABLE_STATUS_CELL =
  'flex items-center justify-center place-self-center text-center'

/** Columns + gaps + row horizontal padding — use for full-width preset row previews. */
export const PRESET_TABLE_MIN_WIDTH_CLASS = 'min-w-[70rem]'
