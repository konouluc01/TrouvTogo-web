import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as messagesApi from '../../api/messages'
import * as objetsApi from '../../api/objets'
import type { Objet } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { CardShell } from '../../components/ui/CardShell'
import { useAuth } from '../../context/useAuth'

export function DashboardHome() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const [mine, setMine] = useState<Objet[]>([])
  const [unread, setUnread] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const u = await messagesApi.countUnread()
        if (cancelled) return
        if (u.success && u.data !== undefined) setUnread(u.data)
        if (isAdmin) {
          setMine([])
          return
        }
        const o = await objetsApi.getMesObjets()
        if (cancelled) return
        if (o.success && o.data) setMine(o.data)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  if (isAdmin) {
    return (
      <div className="space-y-10 text-left">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
            Bonjour{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
            Votre rôle est centré sur la gestion de la plateforme — pas sur la publication d’annonces citoyennes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <CardShell>
            <p className="tt-overline">Messages non lus</p>
            <p className="mt-3 font-display text-4xl font-semibold tabular-nums text-espresso-900 dark:text-cream-50">
              {unread}
            </p>
            <Link to="/dashboard/messages" className="mt-4 inline-block">
              <Button variant="ghost" className="!px-4 !py-2 text-xs">
                Ouvrir la messagerie
              </Button>
            </Link>
          </CardShell>
          <CardShell className="border border-espresso-900/10 dark:border-white/10">
            <p className="tt-overline">Administration</p>
            <p className="mt-2 text-sm text-espresso-900/75 dark:text-cream-100/70">
              Indicateurs, catégories, lieux de dépôt, signalements…
            </p>
            <Link to="/admin" className="mt-4 inline-block">
              <Button className="!px-4 !py-2 text-xs">Ouvrir l’admin</Button>
            </Link>
          </CardShell>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
          Bonjour{user?.username ? `, ${user.username}` : ''}
        </h1>
        <p className="mt-2 text-sm text-espresso-900/65 dark:text-cream-100/70">
          Voici l’activité liée à vos annonces et à vos échanges.
        </p>
      </div>

      <CardShell className="border border-accent/20 bg-accent/[0.04] dark:border-accent/25 dark:bg-accent/[0.06]">
        <p className="tt-overline">Nouvelle annonce</p>
        <p className="mt-2 text-sm text-espresso-900/75 dark:text-cream-100/70">
          Publiez depuis le tableau de bord — objet perdu ou trouvé.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/objets/nouveau?type=PERDU" className="sm:min-w-[12rem]">
            <Button variant="outline" className="w-full justify-center sm:w-auto">
              Signaler un objet perdu
            </Button>
          </Link>
          <Link to="/objets/nouveau?type=TROUVE" className="sm:min-w-[12rem]">
            <Button className="w-full justify-center sm:w-auto">
              Publier un objet trouvé
            </Button>
          </Link>
        </div>
      </CardShell>

      <div className="grid gap-5 md:grid-cols-2">
        <CardShell>
          <p className="tt-overline">Messages non lus</p>
          <p className="mt-3 font-display text-4xl font-semibold tabular-nums text-espresso-900 dark:text-cream-50">
            {unread}
          </p>
          <Link to="/dashboard/messages" className="mt-4 inline-block">
            <Button variant="ghost" className="!px-4 !py-2 text-xs">
              Ouvrir la messagerie
            </Button>
          </Link>
        </CardShell>
        <CardShell>
          <p className="tt-overline">Mes annonces</p>
          <p className="mt-3 font-display text-4xl font-semibold tabular-nums text-espresso-900 dark:text-cream-50">
            {mine.length}
          </p>
          <Link to="/objets" className="mt-4 inline-block">
            <Button variant="outline" className="!px-4 !py-2 text-xs">
              Voir le fil public
            </Button>
          </Link>
        </CardShell>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-espresso-900 dark:text-cream-50">
          Vos publications
        </h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-espresso-900/60 dark:text-cream-100/60">
            Vous n’avez pas encore publié d’objet — utilisez les boutons ci-dessus ou{' '}
            <Link
              to="/objets"
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
            >
              parcourez les annonces
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/objets/${o.id}`}
                  className="block rounded-2xl bg-cream-200/50 px-4 py-3 text-sm font-medium text-espresso-900 ring-1 ring-espresso-900/8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-soft dark:bg-night-800/80 dark:text-cream-100 dark:ring-white/10 dark:hover:bg-night-800"
                >
                  {o.titre}{' '}
                  <span className="text-espresso-900/45 dark:text-cream-100/45">
                    — {o.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
