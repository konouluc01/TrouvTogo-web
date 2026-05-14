import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  combineDateTime,
  splitDatetimeLocal,
} from '../../lib/datetimeLocal'
import { Button } from './Button'

interface DatetimeLocalModalProps {
  open: boolean
  onClose: () => void
  /** Valeur formulaire `yyyy-MM-ddTHH:mm` ou vide */
  value: string
  onCommit: (next: string) => void
  title: string
  /** Si vrai, empêche de valider sans date/heure */
  required?: boolean
}

export function DatetimeLocalModal({
  open,
  onClose,
  value,
  onCommit,
  title,
  required = false,
}: DatetimeLocalModalProps) {
  const [mounted, setMounted] = useState(false)
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const { date, time } = splitDatetimeLocal(value)
    setDateStr(date)
    setTimeStr(time)
    setError(null)
  }, [open, value])

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
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function validateAndCommit() {
    setError(null)
    if (!dateStr.trim()) {
      if (required) {
        setError('Choisissez une date.')
        return
      }
      onCommit('')
      onClose()
      return
    }
    if (!timeStr.trim()) {
      setError('Choisissez aussi l’heure.')
      return
    }
    onCommit(combineDateTime(dateStr, timeStr))
    onClose()
  }

  if (!mounted || typeof document === 'undefined') return null

  const modal = (
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          key="datetime-overlay"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-night-950/70 backdrop-blur-md dark:bg-black/80"
            aria-label="Fermer"
            onClick={onClose}
          />
          <motion.div
            key="datetime-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="datetime-modal-title"
            className="relative z-10 w-full max-w-md rounded-[2rem] bg-cream-50 p-6 shadow-2xl ring-1 ring-espresso-900/[0.08] dark:bg-night-900 dark:ring-white/12"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="datetime-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-espresso-900 dark:text-cream-50"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm text-espresso-900/70 dark:text-cream-100/65">
              Le calendrier et l’horloge s’ouvrent ici, au centre de l’écran.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-1.5 text-left">
                <label
                  htmlFor="modal-date"
                  className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                >
                  Date
                </label>
                <input
                  id="modal-date"
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="tt-field-outline w-full rounded-[calc(1.25rem-0.375rem)] px-4 py-3 text-sm text-espresso-900 outline-none ring-1 ring-espresso-900/[0.07] dark:bg-night-900 dark:text-cream-50 dark:ring-white/[0.09]"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label
                  htmlFor="modal-time"
                  className="text-xs font-medium uppercase tracking-[0.16em] text-sage-700/90 dark:text-emerald-200/80"
                >
                  Heure
                </label>
                <input
                  id="modal-time"
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  step={60}
                  className="tt-field-outline w-full rounded-[calc(1.25rem-0.375rem)] px-4 py-3 text-sm text-espresso-900 outline-none ring-1 ring-espresso-900/[0.07] dark:bg-night-900 dark:text-cream-50 dark:ring-white/[0.09]"
                />
              </div>
              {error ? (
                <p className="text-sm font-medium text-red-700 dark:text-red-300/95">{error}</p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              <Button type="button" variant="primary" onClick={validateAndCommit}>
                Valider
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
