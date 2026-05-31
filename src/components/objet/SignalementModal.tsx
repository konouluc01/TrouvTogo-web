import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'

interface SignalementModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (message: string) => Promise<void>
  pending?: boolean
  itemLabel?: string
}

export function SignalementModal({
  open,
  onClose,
  onConfirm,
  pending = false,
  itemLabel,
}: SignalementModalProps) {
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      setMessage('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending, onClose])

  if (!mounted || typeof document === 'undefined') return null

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-night-950/70 backdrop-blur-md"
            onClick={() => !pending && onClose()}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-[2rem] bg-cream-50 p-6 shadow-2xl ring-1 ring-espresso-900/[0.08] dark:bg-night-900 dark:ring-white/12"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <h2 className="font-display text-xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50">
              Signaler l'annonce
            </h2>
            <p className="mt-2 text-sm text-espresso-900/70 dark:text-cream-100/60">
              Vous signalez l'annonce : <span className="font-medium text-espresso-900 dark:text-cream-50">{itemLabel}</span>
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-espresso-900/50 dark:text-cream-100/40">
                  Motif du signalement
                </label>
                <textarea
                  autoFocus
                  className="w-full rounded-2xl bg-black/[0.03] p-4 text-sm text-espresso-900 ring-1 ring-espresso-900/10 placeholder:text-espresso-900/30 focus:outline-none focus:ring-2 focus:ring-accent/50 dark:bg-white/[0.04] dark:text-cream-50 dark:ring-white/10 dark:placeholder:text-cream-100/20"
                  placeholder="Expliquez pourquoi vous signalez cette annonce..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={pending}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  disabled={pending || !message.trim()}
                  onClick={() => onConfirm(message)}
                >
                  {pending ? 'Envoi...' : 'Envoyer le signalement'}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  onClick={onClose}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
