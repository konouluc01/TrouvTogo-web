import { Button } from './Button'

interface PaginationBarProps {
  page: number
  totalPages: number
  totalItems: number
  rangeStart: number
  rangeEnd: number
  onPageChange: (next: number) => void
}

/** Pagination pour listes filtrées côté client (admin). */
export function PaginationBar({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
}: PaginationBarProps) {
  if (totalItems === 0) return null

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-espresso-900/10 pt-4 text-sm dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-espresso-900/65 dark:text-cream-100/60">
        Affichage {rangeStart}–{rangeEnd} sur {totalItems}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="!px-3 !py-1.5 !text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Précédent
        </Button>
        <span className="tabular-nums text-espresso-900/80 dark:text-cream-100/75">
          Page {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="!px-3 !py-1.5 !text-xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
