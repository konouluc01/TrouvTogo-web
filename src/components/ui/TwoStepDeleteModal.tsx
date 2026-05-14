import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface TwoStepDeleteModalProps {
  open: boolean
  onClose: () => void
  /** Appelé après la 2ᵉ confirmation ; doit retourner une Promise (suppression API). */
  onConfirmDelete: () => Promise<void>
  pending?: boolean
  /** Ex. titre de l’annonce pour contextualiser */
  itemLabel?: string
}

export function TwoStepDeleteModal({
  open,
  onClose,
  onConfirmDelete,
  pending = false,
  itemLabel,
}: TwoStepDeleteModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) setStep(1)
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

  async function handleFinalDelete() {
    await onConfirmDelete()
  }

  if (!mounted || typeof document === 'undefined') return null

  const modal = (
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            disabled={pending}
            className="absolute inset-0 bg-night-950/70 backdrop-blur-md transition-opacity disabled:pointer-events-none dark:bg-black/80"
            aria-label="Fermer la boîte de dialogue"
            onClick={() => {
              if (!pending) onClose()
            }}
          />

          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={
              step === 1
                ? 'Première confirmation avant suppression d’annonce'
                : 'Confirmation définitive de suppression'
            }
            className="relative z-10 w-full max-w-md rounded-[2rem] bg-cream-50 p-6 shadow-2xl ring-1 ring-espresso-900/[0.08] dark:bg-night-900 dark:ring-white/12"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {step === 1 ? (
              <div>
                <p className="mb-2 tt-overline">Étape 1 sur 2</p>
                <h2 className="font-display text-xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50">
                  Supprimer cette annonce ?
                </h2>
                {itemLabel ? (
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-espresso-900/80 dark:text-cream-100/75">
                    « {itemLabel} »
                  </p>
                ) : null}
                <p className="mt-4 text-sm leading-relaxed text-espresso-900/75 dark:text-cream-100/70">
                  L’annonce sera retirée du fil public. Une seconde confirmation vous
                  sera demandée avant toute suppression définitive.
                </p>
                <div className="mt-8 flex flex-wrap justify-end gap-3">
                  <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>
                    Annuler
                  </Button>
                  <Button type="button" variant="primary" disabled={pending} onClick={() => setStep(2)}>
                    Continuer
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2 tt-overline">Étape 2 sur 2</p>
                <h2 className="font-display text-xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50">
                  Confirmation définitive
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-espresso-900/75 dark:text-cream-100/70">
                  Cette action est{' '}
                  <span className="font-semibold text-red-700 dark:text-red-300">
                    irréversible
                  </span>
                  . Confirmez-vous la suppression définitive de cette annonce ?
                </p>
                <div className="mt-8 flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="!border-red-500/35 !text-red-700 !ring-red-500/30 hover:!bg-red-500/10 dark:!border-red-400/40 dark:!text-red-300"
                    onClick={() => void handleFinalDelete()}
                  >
                    {pending ? 'Suppression…' : 'Supprimer définitivement'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
