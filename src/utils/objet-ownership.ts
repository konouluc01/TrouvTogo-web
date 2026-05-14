import type { Objet } from '../api/types'

export function isObjetOwner(
  user: { id: number; username: string },
  objet: Objet,
): boolean {
  if (objet.proprietaireId != null) return objet.proprietaireId === user.id
  if (objet.proprietaireUsername)
    return objet.proprietaireUsername.toLowerCase() === user.username.toLowerCase()
  return false
}
