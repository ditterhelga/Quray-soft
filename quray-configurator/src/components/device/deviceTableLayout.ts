export const DEVICE_TABLE_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-8'

export const DEVICE_TABLE_HEADER =
  `${DEVICE_TABLE_GRID} pr-6 pl-0 text-sm font-light text-text-muted`

export const DEVICE_TABLE_STATUS_CELL =
    'flex items-center justify-end gap-6'

/** Fixed width for inline actions — keeps status chips aligned across row types. */
export const DEVICE_TABLE_STATUS_ACTIONS_SLOT =
  'flex w-[4.75rem] shrink-0 items-center justify-start gap-3'
