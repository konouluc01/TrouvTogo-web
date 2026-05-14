import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as messagesApi from '../api/messages'
import type { Message } from '../api/types'
import { Footer } from '../components/layout/Footer'
import { PageFade } from '../components/layout/PageFade'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'

/** Intervalle de mise à jour du fil (onglet visible), style messagerie temps réel. */
const THREAD_POLL_MS = 4000

function sortMessages(list: Message[]) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0
    return ta - tb
  })
}

export function MessageThreadPage() {
  const { userId: userIdParam } = useParams()
  const otherId = Number(userIdParam)
  const { user } = useAuth()
  const { push } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMsgCountRef = useRef(0)

  const fetchThread = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false
      if (!Number.isFinite(otherId) || otherId <= 0) return
      if (!silent) setLoading(true)
      try {
        const res = await messagesApi.conversationMessages(otherId)
        if (res.success && res.data) {
          const list = sortMessages(res.data)
          setMessages((prev) => {
            const sig = (arr: Message[]) => arr.map((m) => m.id).join(',')
            if (sig(prev) === sig(list)) return prev
            return list
          })
        } else if (!silent) {
          setMessages([])
        }
      } catch {
        if (!silent) {
          setMessages([])
          push({
            message: 'Impossible de charger la conversation.',
            variant: 'error',
          })
        }
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [otherId, push],
  )

  /** Chargement initial (spinner). */
  useEffect(() => {
    void fetchThread()
  }, [fetchThread])

  /** Polling en arrière-plan : met à jour la discussion sans masquer l’UI. */
  useEffect(() => {
    if (!Number.isFinite(otherId) || otherId <= 0) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void fetchThread({ silent: true })
    }

    const id = window.setInterval(tick, THREAD_POLL_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void fetchThread({ silent: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [otherId, fetchThread])

  useEffect(() => {
    prevMsgCountRef.current = 0
  }, [otherId])

  /** Défile en bas quand de nouveaux messages arrivent (polling ou envoi). */
  useEffect(() => {
    if (loading) return
    const n = messages.length
    if (n === 0) {
      prevMsgCountRef.current = 0
      return
    }
    if (n > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({
        behavior: prevMsgCountRef.current === 0 ? 'auto' : 'smooth',
      })
    }
    prevMsgCountRef.current = n
  }, [messages, loading])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t || !user || !Number.isFinite(otherId) || otherId <= 0) return
    setSending(true)
    try {
      const res = await messagesApi.sendMessage({
        destinataireId: otherId,
        contenu: t,
      })
      if (!res.success) throw new Error(res.message || 'Envoi impossible')
      setText('')
      await fetchThread({ silent: true })
    } catch (err) {
      push({
        message: err instanceof Error ? err.message : 'Envoi impossible',
        variant: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  if (!Number.isFinite(otherId) || otherId <= 0) {
    return (
      <PageFade>
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
          <p className="text-sm text-red-800 dark:text-red-200">Conversation invalide.</p>
          <Link
            to="/messages"
            className="mt-4 inline-block text-sm font-semibold text-accent dark:text-emerald-400"
          >
            ← Retour aux conversations
          </Link>
        </div>
        <Footer />
      </PageFade>
    )
  }

  return (
    <PageFade>
      <div className="mx-auto flex min-h-[min(100dvh,720px)] max-w-3xl flex-col px-4 pb-24 pt-28 md:px-8">
        <header className="mb-6 shrink-0">
          <Link
            to="/messages"
            className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400"
          >
            ← Conversations
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] bg-black/[0.025] ring-1 ring-espresso-900/[0.06] dark:bg-white/[0.04] dark:ring-white/[0.08]">
          <div className="flex min-h-[280px] flex-1 flex-col rounded-[calc(2rem-0.375rem)] bg-cream-50/90 dark:bg-night-900/85">
            {loading ? (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-espresso-900/60 dark:text-cream-100/55">
                Chargement…
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-espresso-900/55 dark:text-cream-100/50">
                    Aucun message pour l’instant. Écrivez ci-dessous pour démarrer
                    l’échange.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.expediteurId === user?.id
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? 'bg-espresso-900 text-cream-50 dark:bg-accent dark:text-cream-50'
                              : 'bg-cream-200/90 text-espresso-900 dark:bg-night-800 dark:text-cream-100'
                          }`}
                        >
                          {m.contenu}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t border-espresso-900/10 p-4 dark:border-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="sr-only" htmlFor="thread-msg">
                  Message
                </label>
                <textarea
                  id="thread-msg"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  placeholder="Votre message…"
                  className="min-h-[3rem] flex-1 resize-y rounded-2xl border-0 bg-cream-100 px-4 py-3 text-sm text-espresso-900 shadow-inner ring-1 ring-espresso-900/10 outline-none transition-shadow focus:ring-2 focus:ring-accent/35 dark:bg-night-800 dark:text-cream-50 dark:ring-white/12 dark:placeholder:text-cream-100/40 dark:focus:ring-accent/45"
                />
                <Button
                  type="submit"
                  className="w-full shrink-0 sm:w-auto"
                  disabled={sending || !text.trim()}
                >
                  {sending ? 'Envoi…' : 'Envoyer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </PageFade>
  )
}
