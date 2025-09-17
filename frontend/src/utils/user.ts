import type { User } from '../types/user.types'

/**
 * Gets the display name for a user
 * Falls back to username if name is not available
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.username
}

/**
 * Gets the initials for a user's avatar
 */
export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user)
  const parts = name.split(' ')
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}