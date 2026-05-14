import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export function Footer() {
  const { user } = useAuth()
  return (
    <footer className="border-t border-espresso-900/8 bg-cream-100/90 py-20 dark:border-white/10 dark:bg-night-950/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:justify-between md:px-8">
        <div className="max-w-md space-y-4">
          <p className="font-display text-2xl font-semibold text-espresso-900 dark:text-cream-50">
            TrouvTogo
          </p>
          <p className="text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
            Une plateforme civique pour retrouver ce qui compte — avec une équipe
            locale et des échanges sécurisés entre citoyens au Togo.
          </p>
        </div>
        <div className="flex flex-wrap gap-10 text-sm">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-700 dark:text-emerald-200/80">
              Parcourir
            </p>
            <ul className="space-y-2 text-espresso-900/75 dark:text-cream-100/70">
              <li>
                <Link className="hover:text-espresso-900 dark:hover:text-cream-50" to="/objets">
                  Annonces
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-espresso-900 dark:hover:text-cream-50"
                  to={
                    user
                      ? user.role === 'ROLE_ADMIN'
                        ? '/admin'
                        : '/objets/nouveau'
                      : '/inscription'
                  }
                >
                  {user
                    ? user.role === 'ROLE_ADMIN'
                      ? 'Administration'
                      : 'Publier une annonce'
                    : 'Créer un compte'}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-700 dark:text-emerald-200/80">
              Confiance
            </p>
            <ul className="space-y-2 text-espresso-900/75 dark:text-cream-100/70">
              <li>
                <span>Messagerie sur la plateforme</span>
              </li>
              <li>
                <span>Données protégées</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-16 text-center text-xs text-espresso-900/45 dark:text-cream-100/40">
        © {new Date().getFullYear()} TrouvTogo — pensé pour les communautés togolaises.
      </p>
    </footer>
  )
}
