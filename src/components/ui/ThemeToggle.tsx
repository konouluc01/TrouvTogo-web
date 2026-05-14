import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

export function ThemeToggle() {
  const { effective, toggle } = useTheme()
  const { push } = useToast()

  return (
    <button
      type="button"
      onClick={() => {
        toggle()
        push({
          title: 'Affichage',
          message:
            effective === 'light'
              ? 'Mode sombre activé.'
              : 'Mode clair activé.',
          variant: 'success',
          durationMs: 2600,
        })
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso-900/10 bg-cream-100/80 text-espresso-900 shadow-sm transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cream-200/90 active:scale-[0.96] dark:border-white/10 dark:bg-night-900/80 dark:text-cream-100 dark:hover:bg-night-800"
      aria-label={effective === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {effective === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 14.5A8.5 8.5 0 0112.5 4 8.5 8.5 0 0021 14.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
