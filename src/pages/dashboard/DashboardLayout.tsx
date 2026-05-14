import { NavLink, Outlet } from 'react-router-dom'
import { PageFade } from '../../components/layout/PageFade'
import { useAuth } from '../../context/useAuth'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
    isActive
      ? 'bg-espresso-900 text-cream-50 dark:bg-cream-100 dark:text-night-950'
      : 'text-espresso-900/70 hover:text-espresso-900 dark:text-cream-100/75 dark:hover:text-cream-50'
  }`

export function DashboardLayout() {
  const { user } = useAuth()
  return (
    <PageFade>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-24 pt-28 md:flex-row md:px-8">
        <aside className="md:w-56">
          <p className="mb-4 tt-overline">Espace membre</p>
          <nav className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
            <NavLink to="/dashboard" end className={linkClass}>
              Vue d’ensemble
            </NavLink>
            <NavLink to="/dashboard/profil" className={linkClass}>
              Profil
            </NavLink>
            <NavLink to="/dashboard/messages" className={linkClass}>
              Messages
            </NavLink>
            <NavLink to="/objets" className={linkClass}>
              Annonces publiques
            </NavLink>
            {user?.role === 'ROLE_ADMIN' ? (
              <NavLink to="/admin" className={linkClass}>
                Administration
              </NavLink>
            ) : null}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </PageFade>
  )
}
