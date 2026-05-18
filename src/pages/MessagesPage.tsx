import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as messagesApi from '../api/messages'
import * as objetsApi from '../api/objets'
import type { Conversation, Objet } from '../api/types'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { Button } from '../components/ui/Button'
import { CardShell } from '../components/ui/CardShell'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'

export function MessagesPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const objetParam = searchParams.get('objet')
  const objetIdFromQuery =
    objetParam && !Number.isNaN(Number(objetParam)) ? Number(objetParam) : null

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [objet, setObjet] = useState<Objet | null>(null)
  const [objetLoading, setObjetLoading] = useState(false)
  const [objetError, setObjetError] = useState<string | null>(null)
  const [composeText, setComposeText] = useState('')
  const [composeSending, setComposeSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const refreshConversations = useCallback(async () => {
    try {
      const res = await messagesApi.listConversations()
      if (res.success && res.data) setConversations(res.data)
      else setConversations([])
    } catch {
      setConversations([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refreshConversations()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshConversations])

  useEffect(() => {
    if (objetIdFromQuery == null) {
      setObjet(null)
      setObjetError(null)
      return
    }
    let cancelled = false
    setObjetLoading(true)
    setObjetError(null)
    objetsApi
      .getObjet(objetIdFromQuery)
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) {
          setObjet(res.data)
          setComposeText(`Bonjour, je vous contacte au sujet de l'annonce : "${res.data.titre}"`)
        } else {
          setObjet(null)
          setObjetError(res.message || 'Annonce introuvable.')
        }
        setObjetLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setObjet(null)
          setObjetError('Impossible de charger l’annonce.')
          setObjetLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [objetIdFromQuery])

  async function onSendFirstMessage(e: FormEvent) {
    e.preventDefault()
    if (!objet?.proprietaireId || !composeText.trim() || !user) return
    if (objet.proprietaireId === user.id) return
    setComposeSending(true)
    setSendError(null)
    try {
      const res = await messagesApi.sendMessage({
        destinataireId: objet.proprietaireId,
        contenu: composeText.trim(),
        objetId: objet.id,
      })
      if (!res.success) throw new Error(res.message || 'Envoi impossible')
      push({ message: 'Message envoyé.', variant: 'success' })
      setComposeText('')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('objet')
        return next
      })
      await refreshConversations()
      navigate(`/messages/thread/${objet.proprietaireId}`, { replace: true })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Erreur d’envoi')
    } finally {
      setComposeSending(false)
    }
  }

  const showCompose =
    objetIdFromQuery != null &&
    !objetLoading &&
    objet &&
    objet.proprietaireId != null &&
    user &&
    objet.proprietaireId !== user.id

  const showOwnListing =
    objetIdFromQuery != null &&
    !objetLoading &&
    objet &&
    user != null &&
    objet.proprietaireId === user.id

  return (
    <PageFade>
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
        <header className="mb-10 space-y-2 text-left">
          <p className="tt-overline">Messagerie</p>
          <h1 className="tt-page-title">Vos conversations</h1>
        </header>

        {objetIdFromQuery != null ? (
          objetLoading ? (
            <div
              className="mb-10 h-40 animate-pulse rounded-[2rem] bg-cream-200/80 dark:bg-night-800/70"
              aria-hidden
            />
          ) : objetError && !objet ? (
            <CardShell className="mb-10">
              <p
                className="text-sm text-red-800 dark:text-red-200"
                role="alert"
              >
                {objetError}
              </p>
            </CardShell>
          ) : showCompose ? (
            <CardShell className="mb-10">
              <p className="tt-overline mb-2">Contacter le propriétaire</p>
              <p className="font-display text-lg font-semibold text-espresso-900 dark:text-cream-50">
                {objet!.titre}
              </p>
              <form onSubmit={onSendFirstMessage} className="mt-4 space-y-3">
                <label className="sr-only" htmlFor="compose-msg">
                  Votre message
                </label>
                <textarea
                  id="compose-msg"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  rows={4}
                  required
                  minLength={1}
                  placeholder="Bonjour, je vous contacte au sujet de cette annonce…"
                  className="tt-search-input min-h-[6rem] resize-y py-3"
                />
                {sendError ? (
                  <p
                    className="text-sm text-red-800 dark:text-red-200"
                    role="alert"
                  >
                    {sendError}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={composeSending || !composeText.trim()}
                >
                  {composeSending ? 'Envoi…' : 'Envoyer le message'}
                </Button>
              </form>
            </CardShell>
          ) : showOwnListing ? (
            <CardShell className="mb-10">
              <p className="text-sm text-espresso-900/70 dark:text-cream-100/70">
                Il s’agit de votre propre annonce — utilisez la messagerie pour
                répondre aux personnes qui vous écrivent depuis leurs comptes.
              </p>
              <Link
                to={`/objets/${objet!.id}`}
                className="mt-4 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
              >
                Retour à l’annonce
              </Link>
            </CardShell>
          ) : objet && objet.proprietaireId == null ? (
            <CardShell className="mb-10">
              <p className="text-sm text-espresso-900/70 dark:text-cream-100/70">
                Impossible d’identifier le propriétaire de cette annonce pour
                l’instant. Réessayez plus tard ou contactez le support.
              </p>
            </CardShell>
          ) : null
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-[1.5rem] bg-cream-200/80 dark:bg-night-800/70"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <CardShell>
            <p className="text-sm text-espresso-900/65 dark:text-cream-100/70">
              Aucune conversation pour le moment. Ouvrez une fiche objet et
              utilisez « Contacter via la plateforme » pour écrire au
              propriétaire.
            </p>
            <Link
              className="mt-4 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
              to="/objets"
            >
              Parcourir les annonces
            </Link>
          </CardShell>
        ) : (
          <ul className="space-y-4">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/messages/thread/${c.otherUserId}`}
                  className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <CardShell className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-espresso-900 dark:text-cream-50">
                          {c.otherUser?.name ?? `Utilisateur #${c.otherUserId}`}
                        </p>
                        {c.lastMessage?.content ? (
                          <p className="mt-1 line-clamp-2 text-sm text-espresso-900/60 dark:text-cream-100/55">
                            {c.lastMessage.content}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-espresso-900/45 dark:text-cream-100/40">
                            Touchez pour ouvrir la conversation
                          </p>
                        )}
                      </div>
                      {c.unreadCount > 0 ? (
                        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-cream-50">
                          {c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </CardShell>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </PageFade>
  )
}
