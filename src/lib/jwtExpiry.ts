/** Décodage minimal du payload JWT (sans vérification de signature). */

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) base64 += '='.repeat(4 - pad)
    return JSON.parse(atob(base64)) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * `true` si le jeton est expiré ou illisible.
 * `skewMs` : marge avant l’heure réelle pour éviter une requête refusée à la dernière seconde.
 */
export function isJwtExpired(token: string, skewMs = 15_000): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload) return true
  if (typeof payload.exp !== 'number') return false
  return payload.exp * 1000 < Date.now() + skewMs
}
