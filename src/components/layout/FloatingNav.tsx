import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMessageNotifications } from '../../context/MessageNotificationsContext'
import { useAuth } from '../../context/useAuth'
import { Button } from '../ui/Button'
import { MessageSoundToggle } from './MessageSoundToggle'
import { ThemeToggle } from '../ui/ThemeToggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `
  block rounded-full px-4 py-3 text-base font-medium tracking-tight transition-colors
  duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
  md:inline-block md:py-2 md:text-sm
  ${isActive ? 'bg-espresso-900 text-cream-50 dark:bg-cream-100 dark:text-night-950' : 'text-espresso-900/75 hover:text-espresso-900 dark:text-cream-100/80 dark:hover:text-cream-50'}
`

const navLinkClassDesktop = ({ isActive }: { isActive: boolean }) =>
  `
  rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors
  duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
  ${isActive ? 'bg-espresso-900 text-cream-50 dark:bg-cream-100 dark:text-night-950' : 'text-espresso-900/75 hover:text-espresso-900 dark:text-cream-100/80 dark:hover:text-cream-50'}
`

function UnreadCountBadge({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <span className="min-w-[1.25rem] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-cream-50 tabular-nums dark:bg-emerald-500">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function FloatingNav() {
  const { user, loading } = useAuth()
  const { unreadCount } = useMessageNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-3 pt-4 sm:px-4 md:px-8 md:pt-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-auto flex w-full max-w-6xl min-w-0 flex-1 items-center justify-between gap-2 rounded-full border border-white/60 bg-cream-50/75 py-2 pl-3 pr-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-night-900/75 sm:gap-3 sm:px-4 md:px-5"
      >
        <Link
          to="/"
          className="min-w-0 shrink font-display text-base font-semibold tracking-tight text-espresso-900 dark:text-cream-50 sm:text-lg"
        >
          TrouvTogo
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClassDesktop}>
            Accueil
          </NavLink>
          <NavLink to="/objets" className={navLinkClassDesktop}>
            Annonces
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClassDesktop}>
                Mon espace
              </NavLink>
              {user.role === 'ROLE_ADMIN' ? (
                <NavLink to="/admin" className={navLinkClassDesktop}>
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : null}
          {user ? (
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `${navLinkClassDesktop({ isActive })} inline-flex items-center gap-1.5`
              }
            >
              Messages
              <UnreadCountBadge count={unreadCount} />
            </NavLink>
          ) : null}
        </nav>

        {/* Actions desktop */}
        <div className="hidden min-w-0 shrink-0 items-center gap-2 md:flex md:gap-2">
          <ThemeToggle />
          {!loading && user ? <MessageSoundToggle /> : null}
          {!loading && user ? (
            <>
              <Link to="/dashboard/profil" className="hidden lg:inline">
                <span className="max-w-[8rem] truncate text-sm font-medium text-espresso-900/80 dark:text-cream-100/85">
                  {user.username}
                </span>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="!px-4 !py-2 text-xs md:text-sm">
                  Tableau de bord
                </Button>
              </Link>
            </>
          ) : !loading ? (
            <>
              <Link to="/connexion">
                <Button variant="ghost" className="!px-4 !py-2 text-xs md:text-sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/inscription">
                <Button className="!px-4 !py-2 text-xs md:text-sm" variant="primary">
                  Créer un compte
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile : thème + menu */}
        <div className="flex shrink-0 items-center gap-1.5 md:hidden">
          <ThemeToggle />
          {!loading && user ? <MessageSoundToggle /> : null}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso-900/10 bg-cream-100/90 text-espresso-900 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 dark:border-white/10 dark:bg-night-800/90 dark:text-cream-100"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Ouvrir le menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 7h14M5 12h14M5 17h14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-menu"
            id="mobile-nav-menu"
            className="pointer-events-auto fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute right-0 top-0 flex h-full max-w-[min(100vw,20rem)] flex-col border-l border-white/10 bg-cream-50/98 p-6 shadow-2xl dark:bg-night-950/98"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-espresso-900 dark:text-cream-50">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-espresso-900/60 hover:bg-black/5 dark:text-cream-100/70 dark:hover:bg-white/10"
                  aria-label="Fermer"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Accueil
                </NavLink>
                <NavLink to="/objets" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Annonces
                </NavLink>
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon espace
                    </NavLink>
                    {user.role === 'ROLE_ADMIN' ? (
                      <NavLink
                        to="/admin"
                        className={navLinkClass}
                        onClick={() => setMenuOpen(false)}
                      >
                        Administration
                      </NavLink>
                    ) : null}
                    <NavLink
                      to="/dashboard/profil"
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon profil
                    </NavLink>
                    <NavLink
                      to="/messages"
                      className={({ isActive }) =>
                        `${navLinkClass({ isActive })} flex items-center justify-between gap-2`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>Messages</span>
                      <UnreadCountBadge count={unreadCount} />
                    </NavLink>
                  </>
                ) : null}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-espresso-900/10 pt-8 dark:border-white/10">
                {!loading && user ? (
                  <p className="truncate text-sm text-espresso-900/70 dark:text-cream-100/65">
                    {user.username}
                  </p>
                ) : null}
                {!loading && user ? (
                  <Link to="/dashboard" className="w-full" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Tableau de bord
                    </Button>
                  </Link>
                ) : !loading ? (
                  <>
                    <Link to="/connexion" className="w-full" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-center">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/inscription" className="w-full" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full justify-center" variant="primary">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
