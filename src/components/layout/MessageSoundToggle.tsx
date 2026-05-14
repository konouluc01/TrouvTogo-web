import {
  unlockNotificationAudio,
  useMessageNotifications,
} from '../../context/MessageNotificationsContext'

export function MessageSoundToggle() {
  const { soundEnabled, setSoundEnabled } = useMessageNotifications()

  return (
    <button
      type="button"
      onClick={() => {
        unlockNotificationAudio()
        setSoundEnabled(!soundEnabled)
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso-900/10 bg-cream-100/80 text-espresso-900 shadow-sm transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cream-200/90 active:scale-[0.96] dark:border-white/10 dark:bg-night-900/80 dark:text-cream-100 dark:hover:bg-night-800"
      title={
        soundEnabled
          ? 'Son des notifications activé (cliquer pour couper)'
          : 'Son des notifications désactivé (cliquer pour activer)'
      }
      aria-pressed={soundEnabled}
      aria-label={
        soundEnabled
          ? 'Désactiver le bip des nouveaux messages'
          : 'Activer le bip des nouveaux messages'
      }
    >
      {soundEnabled ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 003.4 0" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 8a6 6 0 017.9-5.24M4 4l16 16" />
          <path d="M18 8c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21h3.4" />
        </svg>
      )}
    </button>
  )
}
