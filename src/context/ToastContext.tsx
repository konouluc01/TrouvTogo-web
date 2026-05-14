import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastInput {
  title?: string
  message: string
  variant?: ToastVariant
  durationMs?: number
}

export interface ToastItem extends Required<Pick<ToastInput, 'message' | 'variant'>> {
  id: string
  title?: string
  durationMs: number
}

interface ToastContextValue {
  push: (t: ToastInput) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (input: ToastInput) => {
      const id = genId()
      const item: ToastItem = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? 'info',
        durationMs: input.durationMs ?? 4200,
      }
      setToasts((prev) => [...prev, item])
      if (item.durationMs > 0) {
        const tid = setTimeout(() => dismiss(id), item.durationMs)
        timers.current.set(id, tid)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-[100dvh] w-full flex-col-reverse gap-3 p-4 sm:bottom-6 sm:right-6 sm:max-w-md sm:p-0"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: () => void
}) {
  const variantBorder =
    toast.variant === 'success'
      ? 'border-emerald-500/45 dark:border-emerald-400/50'
      : toast.variant === 'error'
        ? 'border-red-500/45 dark:border-red-400/55'
        : 'border-accent/40 dark:border-emerald-400/45'

  const accent =
    toast.variant === 'success'
      ? 'bg-emerald-500'
      : toast.variant === 'error'
        ? 'bg-red-600'
        : 'bg-accent'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className={`
        pointer-events-auto overflow-hidden rounded-2xl border bg-cream-50 text-espresso-900
        shadow-[0_16px_40px_-8px_rgba(28,22,18,0.2),0_0_0_1px_rgba(28,22,18,0.04)]
        backdrop-blur-xl dark:bg-night-800 dark:text-cream-100
        dark:shadow-[0_24px_56px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)]
        dark:ring-1 dark:ring-white/[0.08]
        ${variantBorder}
      `}
    >
      <div className="flex gap-3 p-4">
        <div className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${accent}`} />
        <div className="min-w-0 flex-1 text-left">
          {toast.title ? (
            <p className="font-display text-sm font-semibold text-espresso-900 dark:text-cream-50">
              {toast.title}
            </p>
          ) : null}
          <p className="text-sm leading-snug text-espresso-900/90 dark:text-cream-50/95">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-espresso-900/50 transition-colors hover:bg-black/[0.06] hover:text-espresso-900 dark:text-cream-100/55 dark:hover:bg-white/12 dark:hover:text-cream-50"
          aria-label="Fermer la notification"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider')
  return ctx
}
