import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as categoriesApi from '../api/categories'
import * as objetsApi from '../api/objets'
import type { Categorie, Objet, TypeObjet } from '../api/types'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { ObjetCard } from '../components/objet/ObjetCard'
import { libelleCategorie } from '../lib/categoryLabels'

export function ObjetsBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('q') ?? ''
  const typeParam = searchParams.get('type') as TypeObjet | null

  const [items, setItems] = useState<Objet[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const categorieParam = searchParams.get('categorie')
  const categorieId =
    categorieParam && !Number.isNaN(Number(categorieParam))
      ? Number(categorieParam)
      : undefined

  useEffect(() => {
    setPage(0)
  }, [keyword, typeParam, categorieId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = keyword.trim()
        ? await objetsApi.searchObjets({
            keyword: keyword.trim(),
            type: typeParam ?? undefined,
            categorieId,
            page,
            size: 12,
          })
        : await objetsApi.listObjets({
            type: typeParam ?? undefined,
            page,
            size: 12,
          })
      if (res.success && res.data) {
        setItems(res.data.content)
        setTotalPages(res.data.totalPages)
      }
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [keyword, typeParam, categorieId, page])

  useEffect(() => {
    categoriesApi.listCategories().then((r) => {
      if (r.success && r.data) setCategories(r.data)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function setFilter(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
      return next
    })
    setPage(0)
  }

  return (
    <PageFade>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8">
        <header className="mb-12 space-y-4 text-left">
          <p className="tt-overline">Annonces</p>
          <h1 className="tt-page-title">Objets perdus & trouvés</h1>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const q = String(fd.get('q') ?? '')
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                if (q) next.set('q', q)
                else next.delete('q')
                return next
              })
              setPage(0)
            }}
          >
            <label className="flex flex-1 flex-col gap-1.5 text-left tt-overline-sm">
              Recherche
              <input
                name="q"
                defaultValue={keyword}
                placeholder="Ex. portefeuille, Lomé…"
                className="tt-search-input"
              />
            </label>
            <button type="submit" className="tt-btn-primary-solid shrink-0">
              Filtrer
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={!typeParam}
              onClick={() => setFilter('type', null)}
              label="Tous"
            />
            <FilterChip
              active={typeParam === 'PERDU'}
              onClick={() => setFilter('type', 'PERDU')}
              label="Perdus"
            />
            <FilterChip
              active={typeParam === 'TROUVE'}
              onClick={() => setFilter('type', 'TROUVE')}
              label="Trouvés"
            />
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <span className="tt-overline-sm w-full">Catégories</span>
              <FilterChip
                active={!categorieId}
                onClick={() => setFilter('categorie', null)}
                label="Toutes"
              />
              {categories.map((c) => (
                <FilterChip
                  key={c.id}
                  active={categorieId === c.id}
                  onClick={() => setFilter('categorie', String(c.id))}
                  label={libelleCategorie(c.nom, c.description)}
                />
              ))}
            </div>
          ) : null}
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-[2rem] bg-cream-200/80 dark:bg-night-800/70"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-3xl bg-cream-200/50 px-6 py-12 text-center text-sm text-espresso-900/60 dark:bg-night-800/70 dark:text-cream-100/70">
            Aucune annonce pour ces critères. Essayez d’élargir la recherche.
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((o, i) => (
                <ObjetCard key={o.id} objet={o} index={i} />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-12 flex justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-full bg-cream-200 px-5 py-2 text-sm font-semibold text-espresso-900 transition-colors disabled:opacity-40 dark:bg-night-800 dark:text-cream-100 dark:ring-1 dark:ring-white/10"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full bg-cream-200 px-5 py-2 text-sm font-semibold text-espresso-900 transition-colors disabled:opacity-40 dark:bg-night-800 dark:text-cream-100 dark:ring-1 dark:ring-white/10"
                >
                  Suivant
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
      <Footer />
    </PageFade>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tt-chip ${active ? 'tt-chip-active' : 'tt-chip-inactive'}`}
    >
      {label}
    </button>
  )
}
