import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as adminSignalementsApi from '../../api/adminSignalements'
import type { Signalement } from '../../api/types'
import { isAxiosApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { CardShell } from '../../components/ui/CardShell'
import { Input } from '../../components/ui/Input'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { useClientListFilter } from '../../hooks/useClientListFilter'
import { useToast } from '../../context/ToastContext'

const PAGE_SIZE = 8

function apiErr(err: unknown): string {
  if (isAxiosApiError(err) && err.response?.data && typeof err.response.data === 'object') {
    const m = (err.response.data as { message?: string }).message
    if (m) return m
  }
  return err instanceof Error ? err.message : 'Erreur'
}

function formatDt(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

type Tab = 'all' | 'open'

export function AdminSignalementsPage() {
  const { push } = useToast()
  const [tab, setTab] = useState<Tab>('open')
  const [rows, setRows] = useState<Signalement[]>([])
  const [loading, setLoading] = useState(true)
  const [resolveId, setResolveId] = useState<number | null>(null)
  const [listSearch, setListSearch] = useState('')
  const [listPage, setListPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res =
        tab === 'open'
          ? await adminSignalementsApi.adminListSignalementsUnresolved()
          : await adminSignalementsApi.adminListSignalements()
      if (res.success && res.data) setRows(res.data)
      else push({ message: res.message || 'Chargement impossible', variant: 'error' })
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [tab, push])

  useEffect(() => {
    load()
  }, [load])

  const matchSignalement = useCallback((s: Signalement, q: string) => {
    const titre = s.objetTitre ?? ''
    const parts = [
      titre,
      s.message ?? '',
      s.reporterUsername ?? '',
      String(s.objetId),
      String(s.reporterId),
      s.resolverUsername ?? '',
    ]
    return parts.some((p) => p.toLowerCase().includes(q))
  }, [])

  const {
    filtered: filteredSignalements,
    pageSlice,
    totalPages,
    totalItems,
    currentPage,
    rangeStart,
    rangeEnd,
  } = useClientListFilter(rows, listSearch, matchSignalement, listPage, PAGE_SIZE)

  useEffect(() => {
    setListPage(1)
  }, [listSearch, tab])

  useEffect(() => {
    if (currentPage !== listPage) setListPage(currentPage)
  }, [currentPage, listPage])

  async function resolveOne(id: number) {
    setResolveId(id)
    try {
      const res = await adminSignalementsApi.adminResolveSignalement(id)
      if (!res.success) throw new Error(res.message || 'Échec')
      push({ message: 'Signalement marqué comme résolu.', variant: 'success' })
      await load()
    } catch (err) {
      push({ message: apiErr(err), variant: 'error' })
    } finally {
      setResolveId(null)
    }
  }

  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
          Signalements
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Annonces signalées par les utilisateurs — traiter et clôturer lorsque c’est résolu.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'open' ? 'primary' : 'outline'}
          className="!px-4 !py-2 !text-xs"
          onClick={() => setTab('open')}
        >
          Non résolus
        </Button>
        <Button
          type="button"
          variant={tab === 'all' ? 'primary' : 'outline'}
          className="!px-4 !py-2 !text-xs"
          onClick={() => setTab('all')}
        >
          Tous
        </Button>
      </div>

      <CardShell className="overflow-x-auto">
        {loading ? (
          <p className="text-sm text-espresso-900/55">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-espresso-900/55">
            {tab === 'open' ? 'Aucun signalement en attente.' : 'Aucun signalement enregistré.'}
          </p>
        ) : (
          <>
            <div className="mb-4 max-w-md">
              <Input
                id="admin-sign-search"
                label="Rechercher"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Titre, auteur, message, n° annonce…"
                autoComplete="off"
              />
            </div>
            {filteredSignalements.length === 0 ? (
              <p className="text-sm text-espresso-900/55">
                Aucun résultat pour « {listSearch.trim()} ».
              </p>
            ) : (
              <>
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-espresso-900/10 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-900/55 dark:border-white/10 dark:text-cream-100/45">
                      <th className="pb-3 pr-3">Annonce</th>
                      <th className="pb-3 pr-3">Signalé par</th>
                      <th className="pb-3 pr-3">Message</th>
                      <th className="pb-3 pr-3">Date</th>
                      <th className="pb-3 pr-3">Statut</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-espresso-900/[0.06] align-top dark:border-white/[0.06]"
                >
                  <td className="py-3 pr-3">
                    <Link
                      to={`/objets/${s.objetId}`}
                      className="font-medium text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
                    >
                      {s.objetTitre ?? `Objet #${s.objetId}`}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-espresso-900/80 dark:text-cream-100/75">
                    {s.reporterUsername ?? `#${s.reporterId}`}
                  </td>
                  <td className="max-w-[14rem] py-3 pr-3 text-espresso-900/75 dark:text-cream-100/70">
                    {s.message?.trim() ? s.message : '—'}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-3 text-espresso-900/60 dark:text-cream-100/55">
                    {formatDt(s.createdAt)}
                  </td>
                  <td className="py-3 pr-3">
                    {s.resolved ? (
                      <span className="rounded-full bg-espresso-900/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-espresso-800 dark:bg-white/10 dark:text-cream-100/85">
                        Résolu
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-400/25 dark:text-amber-100/95">
                        Ouvert
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {!s.resolved ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="!px-3 !py-1.5 !text-xs"
                        disabled={resolveId === s.id}
                        onClick={() => resolveOne(s.id)}
                      >
                        {resolveId === s.id ? '…' : 'Résoudre'}
                      </Button>
                    ) : (
                      <span className="text-xs text-espresso-900/45 dark:text-cream-100/40">
                        {s.resolverUsername ? `par ${s.resolverUsername}` : '—'}
                      </span>
                    )}
                  </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationBar
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onPageChange={setListPage}
                />
              </>
            )}
          </>
        )}
      </CardShell>
    </div>
  )
}
