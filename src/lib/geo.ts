/** Interprète une saisie utilisateur (virgule ou point décimal). */
export function parseCoord(value: string): number | null {
  const t = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!t) return null
  const n = Number(t)
  if (!Number.isFinite(n)) return null
  return n
}

export function isValidLatitude(n: number): boolean {
  return n >= -90 && n <= 90
}

export function isValidLongitude(n: number): boolean {
  return n >= -180 && n <= 180
}

export function openStreetMapUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`
}

/**
 * Carte interactive embarquée (domaine officiel openstreetmap.org).
 * À préférer aux images statiques tierces (souvent indisponibles ou bloquées).
 */
export function openStreetMapEmbedUrl(lat: number, lng: number, delta = 0.012): string {
  const minLon = Math.max(-180, lng - delta)
  const minLat = Math.max(-90, lat - delta)
  const maxLon = Math.min(180, lng + delta)
  const maxLat = Math.min(90, lat + delta)
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`
  const marker = `${lat},${lng}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`
}
