import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as statsApi from '../../api/stats'
import type { CommunauteStats, TimeSeriesPoint } from '../../api/types'
import { CardShell } from '../../components/ui/CardShell'

export function AdminHome() {
  const [communaute, setCommunaute] = useState<CommunauteStats | null>(null)
  const [series, setSeries] = useState<TimeSeriesPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [c, ts] = await Promise.all([
          statsApi.getCommunauteStats(),
          statsApi.getTimeSeries(12),
        ])
        if (cancelled) return
        if (c.success && c.data) setCommunaute(c.data)
        if (ts.success && ts.data) setSeries(ts.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
          Tableau de bord admin
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Vue synthétique de l’activité sur TrouvTogo (données ouvertes via{' '}
          <code className="rounded bg-espresso-900/10 px-1 text-xs dark:bg-white/10">/api/stats</code>
          ).
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CardShell>
          <p className="tt-overline">Communauté</p>
          <p className="mt-3 font-display text-4xl font-semibold tabular-nums text-espresso-900 dark:text-cream-50">
            {loading ? '—' : communaute?.personnesActives ?? '—'}
          </p>
          <p className="mt-1 text-sm text-espresso-900/60 dark:text-cream-100/55">
            personnes actives (estimation plateforme)
          </p>
        </CardShell>
        <CardShell>
          <p className="tt-overline">Modération</p>
          <p className="mt-3 text-sm leading-relaxed text-espresso-900/75 dark:text-cream-100/70">
            Traitez les signalements utilisateurs et gardez le catalogue de catégories à jour.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/admin/signalements"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
            >
              Signalements →
            </Link>
            <Link
              to="/admin/categories"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
            >
              Catégories →
            </Link>
            <Link
              to="/admin/lieux-depot"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
            >
              Lieux de dépôt →
            </Link>
          </div>
        </CardShell>
        <CardShell className="sm:col-span-2 lg:col-span-1">
          <p className="tt-overline">Raccourcis</p>
          <ul className="mt-3 space-y-2 text-sm text-espresso-900/75 dark:text-cream-100/70">
            <li>
              <Link to="/objets" className="font-medium text-accent hover:underline dark:text-emerald-400/95">
                Fil public des annonces
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="font-medium text-accent hover:underline dark:text-emerald-400/95">
                Mon espace membre
              </Link>
            </li>
          </ul>
        </CardShell>
      </div>

      <CardShell>
        <p className="tt-overline">Activité (12 derniers mois)</p>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/60">
          Perdu / trouvé / résolu par période — échelle relative au maximum observé.
        </p>
        {loading ? (
          <p className="mt-6 text-sm text-espresso-900/50">Chargement des séries…</p>
        ) : series.length === 0 ? (
          <p className="mt-6 text-sm text-espresso-900/50">Aucune donnée agrégée pour l’instant.</p>
        ) : (
          <div className="mt-8 space-y-5">
            {series.map((row) => {
              const t = row.lost + row.found + row.resolved || 1
              return (
                <div key={row.key} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-espresso-900/70 dark:text-cream-100/65">
                    <span>{row.name || row.key}</span>
                  </div>
                  <div
                    className="flex h-8 w-full overflow-hidden rounded-xl bg-espresso-900/[0.06] dark:bg-white/[0.08]"
                    title={`P ${row.lost} · T ${row.found} · R ${row.resolved}`}
                  >
                    <span
                      className="h-full bg-amber-500/90 transition-[width] duration-500"
                      style={{ width: `${(row.lost / t) * 100}%` }}
                    />
                    <span
                      className="h-full bg-accent/95 transition-[width] duration-500 dark:bg-emerald-500/85"
                      style={{ width: `${(row.found / t) * 100}%` }}
                    />
                    <span
                      className="h-full bg-espresso-600/35 transition-[width] duration-500 dark:bg-cream-100/40"
                      style={{ width: `${(row.resolved / t) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider text-espresso-900/45 dark:text-cream-100/40">
                    <span>Perdus {row.lost}</span>
                    <span>Trouvés {row.found}</span>
                    <span>Résolus {row.resolved}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardShell>
    </div>
  )
}
