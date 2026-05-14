import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthSplitLayoutProps {
  imageSrc: string
  imageLabel: string
  tagline: string
  footnote?: string
  children: ReactNode
}

export function AuthSplitLayout({
  imageSrc,
  imageLabel,
  tagline,
  footnote,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="box-border flex h-dvh max-h-dvh flex-col overflow-hidden bg-cream-100 pb-4 pt-[5.25rem] dark:bg-night-950 sm:pb-5 sm:pt-24 lg:pb-6 lg:pt-28">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
        {/* Panneau image — mobile : bandeau haut ; desktop : colonne gauche pleine hauteur */}
        <div className="relative h-40 min-h-0 shrink-0 overflow-hidden rounded-b-[2rem] sm:h-48 lg:h-full lg:min-h-0 lg:flex-1 lg:rounded-none lg:rounded-br-[2.5rem] lg:rounded-tr-[2.5rem]">
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20 lg:bg-gradient-to-r lg:from-black/50 lg:via-black/25 lg:to-black/10"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="max-w-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-100/80">
                {imageLabel}
              </p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-cream-50 sm:text-3xl">
                {tagline}
              </p>
              {footnote ? (
                <p className="mt-4 text-sm leading-relaxed text-cream-100/75">{footnote}</p>
              ) : null}
            </motion.div>
          </div>
        </div>

        {/* Formulaire — droite (desktop), pleine largeur en dessous sur mobile */}
        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-8 sm:py-5 lg:max-h-full lg:flex-1 lg:px-12 lg:py-6 xl:px-20">
          <div className="mx-auto w-full max-w-md pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:pb-0">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-espresso-900/55 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-espresso-900 sm:mb-5 dark:text-cream-100/50 dark:hover:text-cream-50"
            >
              <span aria-hidden className="text-lg leading-none">
                ←
              </span>
              Retour à l’accueil
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
