import { NavLink, Outlet } from 'react-router-dom'
import { PageFade } from '../../components/layout/PageFade'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
    isActive
      ? 'bg-night-950 text-cream-50 ring-1 ring-accent/40 dark:bg-accent/20 dark:text-cream-50 dark:ring-accent/45'
      : 'text-espresso-900/75 hover:text-espresso-900 dark:text-cream-100/75 dark:hover:text-cream-50'
  }`

export function AdminLayout() {
  return (
    <PageFade>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-24 pt-28 md:flex-row md:px-8">
        <aside className="md:w-60">
          <p className="mb-1 font-display text-lg font-semibold text-espresso-900 dark:text-cream-50">
            Administration
          </p>
          <p className="mb-4 text-xs text-espresso-900/55 dark:text-cream-100/50">
            Outils réservés aux administrateurs.
          </p>
          <nav className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
            <NavLink to="/admin" end className={linkClass}>
              Indicateurs
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              Catégories
            </NavLink>
            <NavLink to="/admin/lieux-depot" className={linkClass}>
              Lieux de dépôt
            </NavLink>
            <NavLink to="/admin/signalements" className={linkClass}>
              Signalements
            </NavLink>
            <NavLink to="/dashboard" className={`${linkClass({ isActive: false })} mt-2 opacity-90`}>
              ← Espace membre
            </NavLink>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </PageFade>
  )
}
