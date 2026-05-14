import { useMemo } from 'react'

export interface ClientListFilterResult<T> {
  filtered: T[]
  pageSlice: T[]
  totalPages: number
  totalItems: number
  currentPage: number
  rangeStart: number
  rangeEnd: number
}

/**
 * Filtre une liste en mémoire puis pagine (pour petits référentiels admin).
 */
export function useClientListFilter<T>(
  items: T[],
  searchRaw: string,
  match: (item: T, qLower: string) => boolean,
  page: number,
  pageSize: number,
): ClientListFilterResult<T> {
  const q = searchRaw.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter((item) => match(item, q))
  }, [items, q, match])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1)
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  return {
    filtered,
    pageSlice,
    totalPages,
    totalItems,
    currentPage,
    rangeStart,
    rangeEnd,
  }
}
