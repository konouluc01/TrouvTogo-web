/** Chaîne API (`LocalDateTime`) → valeur `datetime-local` */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const s = iso.trim()
  if (s.length >= 16) return s.slice(0, 16)
  return s
}

/** Valeur `datetime-local` → chaîne acceptée par Spring (`LocalDateTime`) */
export function datetimeLocalToBackend(dtLocal: string): string | undefined {
  const t = dtLocal.trim()
  if (!t) return undefined
  let v = t
  if (v.length === 16) v += ':00'
  return v
}

/** Découpe `yyyy-MM-ddTHH:mm` en parties natives `<input type="date|time">`. */
export function splitDatetimeLocal(dt: string): { date: string; time: string } {
  const t = dt.trim()
  if (!t) return { date: '', time: '' }
  const idx = t.indexOf('T')
  if (idx === -1) return { date: t.slice(0, 10), time: '' }
  return {
    date: t.slice(0, idx),
    time: t.slice(idx + 1, idx + 6),
  }
}

/** Recompose la valeur pour `datetime-local` / état formulaire. */
export function combineDateTime(dateStr: string, timeStr: string): string {
  const d = dateStr.trim()
  if (!d) return ''
  const tm = timeStr.trim()
  const time = tm.length >= 5 ? tm.slice(0, 5) : '12:00'
  return `${d}T${time}`
}

/** Affichage lisible (locale fr) pour un champ type `datetime-local`. */
export function formatDatetimeLocalFr(dtLocal: string): string {
  if (!dtLocal.trim()) return ''
  const { date, time } = splitDatetimeLocal(dtLocal)
  if (!date) return ''
  const c = combineDateTime(date, time)
  const parsed = new Date(c.length === 16 ? `${c}:00` : c)
  if (Number.isNaN(parsed.getTime())) return dtLocal
  return parsed.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
