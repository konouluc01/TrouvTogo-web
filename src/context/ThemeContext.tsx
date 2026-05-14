import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'trouvtogo_theme'

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveEffective(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemDark() ? 'dark' : 'light'
  return mode
}

interface ThemeContextValue {
  mode: ThemeMode
  effective: 'light' | 'dark'
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredMode(): ThemeMode {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (s === 'light' || s === 'dark' || s === 'system') return s
  } catch {
    /* ignore */
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [effective, setEffective] = useState<'light' | 'dark'>('light')

  useLayoutEffect(() => {
    const eff = resolveEffective(mode)
    setEffective(eff)
    document.documentElement.classList.toggle('dark', eff === 'dark')
  }, [mode])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const eff = resolveEffective('system')
      setEffective(eff)
      document.documentElement.classList.toggle('dark', eff === 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
  }, [])

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const eff = resolveEffective(prev)
      return eff === 'dark' ? 'light' : 'dark'
    })
  }, [])

  const value = useMemo(
    () => ({ mode, effective, setMode, toggle }),
    [mode, effective, setMode, toggle],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider')
  return ctx
}
