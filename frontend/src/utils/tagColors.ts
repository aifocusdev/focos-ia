import type { TagColor } from '../types/tag.types'

export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export const getContrastColor = (hexColor: string): string => {
  const color = hexColor.replace('#', '')
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

export const getTagColorStyle = (color: TagColor) => {
  const validColor = isValidHexColor(color) ? color : DEFAULT_TAG_COLOR
  return {
    backgroundColor: validColor,
    color: getContrastColor(validColor)
  }
}

export const DEFAULT_TAG_COLOR: TagColor = '#8B5CF6' // Purple as default