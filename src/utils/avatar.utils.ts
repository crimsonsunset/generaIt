/**
 * Avatar utility functions
 */

import { isEmpty, upperFirst, head } from 'lodash-es'

/**
 * Gets avatar character from username (first letter uppercase)
 * @param username - Username string
 * @returns First letter uppercase (e.g., "joe" -> "J")
 */
export function getAvatarChar(username: string): string {
  if (isEmpty(username)) return '?'
  return upperFirst(head(username))
}

/**
 * Generates a consistent color based on username hash
 * @param username - Username string
 * @returns Hex color string
 */
export function getAvatarColor(username: string): string {
  if (isEmpty(username)) return '#6b7280'
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate color from hash (avoid too light/dark colors)
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash) % 20) // 60-80%
  const lightness = 45 + (Math.abs(hash) % 15) // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Gets avatar props for HeroUI Avatar component
 * @param username - Username string
 * @returns Object with name and color for Avatar component
 */
export function getAvatarProps(username: string): { name: string; color: string } {
  return {
    name: getAvatarChar(username),
    color: getAvatarColor(username),
  }
}

