export function libraryListBodyClassName() {
  return 'px-8 pb-8'
}

/** 32px below the Presets/Sets toggle row → gap to column headers. */
export function presetListToolbarClassName() {
  return 'flex flex-wrap items-center justify-between gap-6 px-8 pb-8'
}

export function presetListTableHeaderClassName() {
  return 'px-8'
}

/** @deprecated Use presetListTableHeaderClassName */
export function presetListStickyHeaderClassName() {
  return presetListTableHeaderClassName()
}

/** 20px from column headers to the first preset row. */
export function presetListBodyRowsClassName() {
  return 'mt-5 flex flex-col gap-3'
}

export function presetListBodyEmptyClassName() {
  return 'mt-5 text-sm font-light text-text-muted'
}
