export const ZONE_PALETTE = [
  '#6C5BD9', '#5E3B93', '#913F7E', '#A75465', '#B45846',
  '#B76D3A', '#AC7F39', '#647D46', '#3E8577', '#3E809C',
  '#426AA8', '#22319F',
] as const

export type ZonePaletteColor = typeof ZONE_PALETTE[number]
