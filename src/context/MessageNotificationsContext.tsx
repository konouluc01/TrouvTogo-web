import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as messagesApi from '../api/messages'
import { useAuth } from './useAuth'
import { useToast } from './ToastContext'

const STORAGE_SOUND = 'trouvtogo_message_sound_enabled'
const POLL_MS = 25_000

let sharedAudioContext: AudioContext | null = null

/** À appeler après un geste utilisateur pour autoriser le navigateur à jouer du son. */
export function unlockNotificationAudio(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    if (!sharedAudioContext) sharedAudioContext = new Ctx()
    if (sharedAudioContext.state === 'suspended') {
      void sharedAudioContext.resume()
    }
  } catch {
    /* ignore */
  }
}

function readSoundPreference(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_SOUND)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}

function playIncomingMessageBeep(): void {
  try {
    const ctx = sharedAudioContext
    if (!ctx || ctx.state !== 'running') return

    const t0 = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(784, t0)
    gain.connect(ctx.destination)
    osc.connect(gain)
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12)
    osc.start(t0)
    osc.stop(t0 + 0.13)

    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(988, t0 + 0.08)
    g2.connect(ctx.destination)
    osc2.connect(g2)
    g2.gain.setValueAtTime(0.0001, t0 + 0.08)
    g2.gain.exponentialRampToValueAtTime(0.07, t0 + 0.1)
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
    osc2.start(t0 + 0.08)
    osc2.stop(t0 + 0.22)
  } catch {
    /* ignore */
  }
}

interface MessageNotificationsValue {
  unreadCount: number
  soundEnabled: boolean
  setSoundEnabled: (value: boolean) => void
}

const MessageNotificationsContext = createContext<MessageNotificationsValue | null>(null)

export function MessageNotificationsProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { push } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabledState] = useState(readSoundPreference)
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  const previousRef = useRef<number | null>(null)
  const baselineDoneRef = useRef(false)

  const setSoundEnabled = useCallback((value: boolean) => {
    setSoundEnabledState(value)
    soundEnabledRef.current = value
    try {
      localStorage.setItem(STORAGE_SOUND, value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  /** Premier clic / touche : débloquer l’audio (politique navigateur). */
  useEffect(() => {
    const unlock = () => {
      unlockNotificationAudio()
    }
    document.addEventListener('pointerdown', unlock, { passive: true })
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])

  const poll = useCallback(async () => {
    if (!user || document.visibilityState === 'hidden') return
    try {
      const res = await messagesApi.countUnread()
      const next =
        res.success && typeof res.data === 'number' ? res.data : 0
      setUnreadCount(next)

      if (!baselineDoneRef.current) {
        previousRef.current = next
        baselineDoneRef.current = true
        return
      }

      const prev = previousRef.current ?? next
      if (next > prev && soundEnabledRef.current) {
        playIncomingMessageBeep()
        const delta = next - prev
        push({
          variant: 'info',
          title: 'Nouveau(x) message(s)',
          message:
            delta === 1
              ? 'Vous avez un message non lu.'
              : `${delta} nouveaux messages non lus.`,
        })
      }
      previousRef.current = next
    } catch {
      /* réseau / 403 : on garde le dernier compteur affiché */
    }
  }, [user, push])

  useEffect(() => {
    if (loading) return
    if (!user) {
      setUnreadCount(0)
      previousRef.current = null
      baselineDoneRef.current = false
      return
    }

    baselineDoneRef.current = false
    previousRef.current = null
    void poll()

    const id = window.setInterval(() => {
      void poll()
    }, POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') void poll()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user, loading, poll])

  const value = useMemo(
    () => ({ unreadCount, soundEnabled, setSoundEnabled }),
    [unreadCount, soundEnabled, setSoundEnabled],
  )

  return (
    <MessageNotificationsContext.Provider value={value}>
      {children}
    </MessageNotificationsContext.Provider>
  )
}

export function useMessageNotifications() {
  const ctx = useContext(MessageNotificationsContext)
  if (!ctx) {
    throw new Error(
      'useMessageNotifications doit être utilisé dans MessageNotificationsProvider',
    )
  }
  return ctx
}
