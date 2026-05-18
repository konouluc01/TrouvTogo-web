import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import * as objetsApi from '../api/objets'
import * as statsApi from '../api/stats'
import type { Objet } from '../api/types'
import { LANDING_IMAGES } from '../config/media'
import { useAuth } from '../context/useAuth'
import { HeroVideo } from '../components/landing/HeroVideo'
import { LandingStripVideo } from '../components/landing/LandingStripVideo'
import { Footer } from '../components/layout/Footer'
import { ObjetCard } from '../components/objet/ObjetCard'
import { Button } from '../components/ui/Button'
import { CardShell } from '../components/ui/CardShell'

const testimonialAvatarTones = [
  'bg-accent/15 text-accent ring-accent/30',
  'bg-sage-700/12 text-sage-800 ring-sage-700/25 dark:bg-emerald-500/12 dark:text-emerald-200/95 dark:ring-emerald-400/25',
  'bg-espresso-900/[0.08] text-espresso-900 ring-espresso-900/15 dark:bg-white/10 dark:text-cream-100 dark:ring-white/15',
] as const

function TestimonialPersonIcon({ index }: { index: number }) {
  const tone = testimonialAvatarTones[index % testimonialAvatarTones.length]
  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-2 ${tone}`}
      aria-hidden
    >
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </div>
  )
}

const testimonials = [
  {
    name: 'Afi K.',
    role: 'Étudiante à Lomé',
    quote:
      'J’ai récupéré mon sac en moins d’une semaine. Les messages restaient sur la plateforme, j’ai adoré me sentir en sécurité.',
  },
  {
    name: 'Koffi M.',
    role: 'Commerçant',
    quote:
      'Un client a retrouvé son portefeuille grâce à une annonce. Simple, direct, et ça crée du lien entre nous.',
  },
  {
    name: 'Léa D.',
    role: 'Mère de famille',
    quote:
      'Les photos et le lieu exact ont tout changé. On se parle ici d’abord — c’est rassurant quand on parle d’objets personnels.',
  },
] as const

export function HomePage() {
  const { user } = useAuth()
  const canPublish = Boolean(user && user.role !== 'ROLE_ADMIN')
  const [featured, setFeatured] = useState<Objet[]>([])
  const [activePeople, setActivePeople] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [o, s] = await Promise.all([
          objetsApi.listObjets({ size: 3, page: 0 }),
          statsApi.getCommunauteStats(),
        ])
        if (cancelled) return
        if (o.success && o.data) setFeatured(o.data.content)
        if (s.success && s.data) setActivePeople(s.data.personnesActives)
      } catch {
        if (!cancelled) setFeatured([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative">
      {/* Hero — vidéo plein écran */}
      <HeroVideo>
        <div className="mx-auto min-w-0 max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 md:px-10 md:pb-28 md:pt-32">
          <div className="relative text-left">
            {/* repère vertical — magazine / signalétique */}
            <div
              className="pointer-events-none absolute -left-1 top-2 hidden h-[min(70%,28rem)] w-px bg-gradient-to-b from-accent via-white/35 to-transparent sm:-left-2 md:block"
              aria-hidden
            />
            <div className="relative md:pl-8 lg:pl-12">
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
                className="max-w-[14rem] font-sans text-[10px] font-semibold uppercase leading-relaxed tracking-[0.32em] text-cream-100/75 sm:max-w-none sm:text-[11px] sm:tracking-[0.38em]"
              >
                Plateforme civique — Togo
              </motion.p>

              <motion.h1
                className="mt-8 font-display font-medium tracking-tight text-cream-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
              >
                <span className="block text-[clamp(2.1rem,6vw,3.75rem)] leading-[0.95]">
                  Retrouver
                </span>
                <span className="mt-1 block text-[clamp(2.1rem,6vw,3.75rem)] leading-[0.95]">
                  ce qui compte,
                </span>
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="mt-3 block pl-[clamp(0.5rem,8vw,6rem)] text-[clamp(2.5rem,8.5vw,5.5rem)] leading-[0.92] italic text-cream-200/95"
                >
                  ensemble
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="mt-10 max-w-md border-l-[3px] border-accent/70 pl-6 font-sans text-sm leading-relaxed text-cream-100/88 sm:text-base md:max-w-lg"
              >
                Des visages, des histoires, des objets du quotidien qui reviennent grâce à la confiance d’une
                communauté en ligne.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38, ease: [0.32, 0.72, 0, 1] }}
                className="mt-10 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
              >
                {user ? (
                  canPublish ? (
                    <Link to="/objets/nouveau" className="w-full min-w-0 sm:w-auto">
                      <Button
                        className="w-full justify-center sm:w-auto"
                        trailing={
                          <span aria-hidden className="text-lg leading-none">
                            ↗
                          </span>
                        }
                      >
                        Publier une annonce
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/admin" className="w-full min-w-0 sm:w-auto">
                      <Button
                        className="w-full justify-center sm:w-auto"
                        trailing={
                          <span aria-hidden className="text-lg leading-none">
                            ↗
                          </span>
                        }
                      >
                        Administration
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link to="/inscription" className="w-full min-w-0 sm:w-auto">
                    <Button
                      className="w-full justify-center sm:w-auto"
                      trailing={
                        <span aria-hidden className="text-lg leading-none">
                          ↗
                        </span>
                      }
                    >
                      Commencer gratuitement
                    </Button>
                  </Link>
                )}
                <Link to="/objets" className="w-full min-w-0 sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full justify-center !border-white/50 !text-cream-50 !ring-white/30 hover:!bg-white/10 sm:w-auto"
                  >
                    Voir les annonces
                  </Button>
                </Link>
              </motion.div>
              {canPublish ? (
                <div className="mt-4 flex w-full min-w-0 flex-wrap gap-2 border-t border-white/10 pt-5 sm:mt-5">
                  <Link to="/objets/nouveau?type=PERDU" className="min-w-0">
                    <Button
                      variant="outline"
                      className="!border-white/45 !py-2 !text-xs !text-cream-50 !ring-white/25 hover:!bg-white/10"
                    >
                      Signaler un objet perdu
                    </Button>
                  </Link>
                  <Link to="/objets/nouveau?type=TROUVE" className="min-w-0">
                    <Button
                      variant="outline"
                      className="!border-white/45 !py-2 !text-xs !text-cream-50 !ring-white/25 hover:!bg-white/10"
                    >
                      Signaler un objet trouvé
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* chiffres : bandeau typographique, pas carte « glass » */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="mt-16 grid grid-cols-1 divide-y divide-white/15 border-t border-white/25 sm:mt-20 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:mt-24"
          >
            <div className="flex flex-col justify-end py-7 sm:px-5 sm:py-8 md:px-6">
              <p className="font-display text-[clamp(2.75rem,8vw,4.5rem)] font-semibold leading-none tabular-nums text-cream-50">
                {activePeople !== null ? activePeople : '—'}
              </p>
              <p className="mt-3 max-w-[12rem] font-sans text-[10px] font-medium uppercase leading-snug tracking-[0.22em] text-cream-100/60">
                Personnes actives sur la plateforme
              </p>
            </div>
            <div className="flex flex-col justify-end py-7 sm:px-5 sm:py-8 md:px-6">
              <p className="font-display text-2xl font-medium leading-tight text-cream-50 sm:text-3xl">Annonces</p>
              <p className="mt-2 font-sans text-sm text-cream-100/65">Fil public, photos et lieux pour se retrouver.</p>
            </div>
            <div className="flex flex-col justify-end py-7 sm:px-5 sm:py-8 md:px-6">
              <p className="font-display text-2xl font-medium leading-tight text-cream-50 sm:text-3xl">Échanges</p>
              <p className="mt-2 font-sans text-sm text-cream-100/65">
                Messagerie intégrée — sans exposer tout de suite vos coordonnées.
              </p>
            </div>
          </motion.div>
        </div>
      </HeroVideo>

      {/* Galerie humaine — visages & rues */}
      <section className="border-y border-espresso-900/8 bg-cream-100 px-4 py-24 dark:border-white/10 dark:bg-night-950 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="max-w-2xl space-y-3 text-left">
            <p className="tt-overline">
              Au-delà des écrans
            </p>
            <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
              Des histoires vraies, entre mains qui se tendent.
            </h2>
            <p className="text-base leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
              Photographies réalistes pour rappeler que derrière chaque objet il y a une
              personne — un trajet, une famille, une journée à retrouver.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                src: LANDING_IMAGES.community,
                cap: 'Moments partagés',
                sub: 'Solidarité du quotidien',
              },
              {
                src: LANDING_IMAGES.youth,
                cap: 'Jeunesse connectée',
                sub: 'Mobilité & entraide locale',
              },
              {
                src: LANDING_IMAGES.street,
                cap: 'Ville vivante',
                sub: 'Les lieux où tout peut se retrouver',
              },
            ].map((item, i) => (
              <motion.figure
                key={item.cap}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.75, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
                className="overflow-hidden rounded-[1.75rem] ring-1 ring-espresso-900/10 dark:ring-white/10"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={item.src}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <figcaption className="space-y-1 bg-cream-50/90 px-4 py-4 dark:bg-night-900/90">
                  <p className="font-display text-lg font-semibold text-espresso-900 dark:text-cream-50">
                    {item.cap}
                  </p>
                  <p className="text-sm text-espresso-900/65 dark:text-cream-100/55">
                    {item.sub}
                  </p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <LandingStripVideo />

      {/* Témoignages */}
      <section className="bg-cream-200/35 px-4 py-24 dark:bg-night-900/40 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="max-w-2xl space-y-3 text-left">
            <p className="tt-overline">
              Voix du terrain
            </p>
            <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
              « Quand l’objet revient, le soulagement aussi. »
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
              >
                <CardShell className="h-full">
                  <div className="flex items-start gap-4">
                    <TestimonialPersonIcon index={i} />
                    <div>
                      <p className="font-medium text-espresso-900 dark:text-cream-50">{t.name}</p>
                      <p className="text-xs text-espresso-900/50 dark:text-cream-100/45">{t.role}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-espresso-900/75 dark:text-cream-100/70">
                    « {t.quote} »
                  </p>
                </CardShell>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi + image mains */}
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1] }}
            className="order-2 overflow-hidden rounded-[2rem] ring-1 ring-espresso-900/10 dark:ring-white/10 lg:order-1"
          >
            <img
              src={LANDING_IMAGES.hands}
              alt=""
              className="aspect-[5/4] w-full object-cover"
              loading="lazy"
            />
          </motion.div>
          <div className="order-1 space-y-6 text-left lg:order-2">
            <p className="tt-overline">
              Pourquoi TrouvTogo
            </p>
            <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
              La confiance avant tout : échanger sans vous exposer trop tôt.
            </h2>
            <ul className="space-y-4 text-sm leading-relaxed text-espresso-900/75 dark:text-cream-100/70">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Messagerie intégrée pour garder vos coordonnées privées au bon moment.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Photos et lieu précis pour des retrouvailles plus rapides.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                Statistiques ouvertes sur la vitalité de la communauté — rien de caché.
              </li>
            </ul>
            <Link to={user ? (canPublish ? '/objets/nouveau' : '/admin') : '/inscription'}>
              <Button
                trailing={<span className="text-lg leading-none">↗</span>}
              >
                {user ? (canPublish ? 'Publier une annonce' : 'Administration') : 'Rejoindre la communauté'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche — bento + visuel */}
      <section className="border-y border-espresso-900/8 bg-cream-200/40 px-4 py-24 dark:border-white/10 dark:bg-night-950/80 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 text-left lg:col-span-5">
              <p className="tt-overline">
                Parcours guidé
              </p>
              <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
                Pensé pour être simple, humain, rassurant.
              </h2>
              <p className="text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/60">
                Chaque étape est pensée pour limiter la friction : de la photo à la
                conversation, tout reste sur une interface unique.
              </p>
              <div className="overflow-hidden rounded-[1.75rem] ring-1 ring-espresso-900/10 dark:ring-white/10">
                <img
                  src={LANDING_IMAGES.community}
                  alt=""
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="grid gap-5 lg:col-span-7">
              <div className="grid gap-5 md:grid-cols-2">
                <CardShell>
                  <h3 className="font-display text-xl font-semibold text-espresso-900 dark:text-cream-50">
                    1. Publier
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
                    Ajoutez photos, lieu et date — le carnet d’objets s’enrichit pour
                    toute la communauté.
                  </p>
                </CardShell>
                <CardShell>
                  <h3 className="font-display text-xl font-semibold text-espresso-900 dark:text-cream-50">
                    2. Rechercher
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
                    Filtrez par type, catégorie et mots-clés pour rapprocher les profils.
                  </p>
                </CardShell>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <CardShell>
                  <h3 className="font-display text-xl font-semibold text-espresso-900 dark:text-cream-50">
                    3. Échanger
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
                    Discutez via la messagerie intégrée sans exposer vos coordonnées trop tôt.
                  </p>
                </CardShell>
                <CardShell>
                  <h3 className="font-display text-xl font-semibold text-espresso-900 dark:text-cream-50">
                    4. Récupérer
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
                    Marquez l’objet comme résolu lorsque tout rentre dans l’ordre — la base
                    reste utile pour les prochains cas.
                  </p>
                </CardShell>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau confiance */}
      <section className="border-b border-espresso-900/8 bg-cream-100 px-4 py-14 dark:border-white/10 dark:bg-night-900/50 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <p className="tt-overline">
              Confiance & transparence
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-espresso-900 dark:text-cream-50">
              Une équipe produit, une vision civique, une plateforme vivante.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Vérification des comptes', 'Signalement des abus', 'Données chiffrées en transit'].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-espresso-900/10 bg-cream-50/90 px-4 py-2 text-xs font-semibold text-espresso-800 dark:border-white/10 dark:bg-night-950/80 dark:text-cream-100/85"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 text-left">
              <p className="tt-overline">
                Récent
              </p>
              <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50 md:text-4xl">
                Annonces qui font bouger les lignes.
              </h2>
            </div>
            <Link
              to="/objets"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-emerald-400/95"
            >
              Tout voir
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.length === 0 ? (
              <p className="col-span-full text-center text-sm text-espresso-900/50 dark:text-cream-100/45">
                Les annonces apparaîtront ici lorsque le backend est joignable.
              </p>
            ) : (
              featured.map((o, i) => <ObjetCard key={o.id} objet={o} index={i} />)
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-espresso-900/8 bg-cream-100 px-4 py-24 dark:border-white/10 dark:bg-night-950/90 md:px-8">
        <div className="mx-auto max-w-3xl space-y-10 text-left">
          <h2 className="font-display text-3xl font-semibold text-espresso-900 dark:text-cream-50">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Est-ce gratuit ?',
                a: 'Oui — créer un compte et publier des annonces est gratuit pour les citoyens.',
              },
              {
                q: 'Comment protéger ma vie privée ?',
                a: 'Privilégiez la messagerie intégrée ; ne partagez des contacts personnels qu’une fois la confiance établie.',
              },
              {
                q: 'Qui peut voir mon annonce ?',
                a: 'Les annonces actives sont visibles publiquement pour maximiser les chances de retrouver un objet.',
              },
            ].map((item) => (
              <CardShell key={item.q}>
                <p className="font-medium text-espresso-900 dark:text-cream-50">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-espresso-900/70 dark:text-cream-100/65">
                  {item.a}
                </p>
              </CardShell>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-espresso-900 px-8 py-16 text-center text-cream-50 shadow-xl dark:bg-night-800 dark:ring-1 dark:ring-white/10">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Prêt à aider quelqu’un à sourire à nouveau ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream-100/80">
            Rejoignez TrouvTogo et participez à une file de solidarité locale, moderne
            et digne de confiance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to={user ? '/dashboard' : '/inscription'}>
              <Button className="!bg-cream-50 !text-espresso-900" variant="primary">
                {user ? 'Mon espace' : 'Créer mon compte'}
              </Button>
            </Link>
            <Link to="/objets">
              <Button variant="outline" className="!text-cream-50 !ring-cream-50/40">
                Parcourir les annonces
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
