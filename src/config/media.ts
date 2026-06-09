/**
 * Médias hero / landing.
 * Les MP4 lourds sources doivent être passés par `npm run compress:videos`.
 */
import heroBgMp4 from '../assets/video/hero-bg.mp4'
import landingStripMp4 from '../assets/video/landing-strip.mp4'
import imgCitySunset from '../assets/images/city-with-clouds-sunset.webp'
import imgCommunityHands from '../assets/images/close-up-community-concept-with-hands.webp'
import imgFlagTogo from '../assets/images/flag-togo.webp'
import imgGroupAfricans from '../assets/images/group-africans-feeling-excited-about-what-they-saw-their-cellphone.webp'
import imgTogoFlag3d from '../assets/images/togo-national-flag-isolated-3d-white-background.webp'
import imgFound from '../assets/images/found.webp'
import imgFound1 from '../assets/images/found1.webp'
import imgLost from '../assets/images/lost.webp'
import imgTrouvTogo from '../assets/images/trouvtogo.webp'

/** Poster hero / secours reduced-motion — visuel togolais */
export const HERO_VIDEO_POSTER = imgFlagTogo

/** Bandeau cinéma : poster distinct pour varier le rendu */
export const LANDING_STRIP_VIDEO_POSTER = imgCitySunset

/** Hero : MP4 local optimisé, ou URL absolue via VITE_HERO_VIDEO_URL */
export const HERO_VIDEO_SRC =
  import.meta.env.VITE_HERO_VIDEO_URL?.trim() || heroBgMp4

/** Bandeau cinéma sur la landing (section dédiée) */
export const LANDING_STRIP_VIDEO_SRC = landingStripMp4

export const LANDING_IMAGES = {
  /** Solidarité — mains & lien communautaire */
  community: imgCommunityHands,
  /** Jeunesse connectée — scène locale */
  youth: imgGroupAfricans,
  /**
   * Avatars témoignages — même cliché, recadrages différents (voir `avatarClass` sur la home).
   */
  portraitA: imgGroupAfricans,
  portraitB: imgGroupAfricans,
  portraitC: imgGroupAfricans,
  /** Ville — horizon urbain africain */
  street: imgCitySunset,
  /** Section « Pourquoi » & pages auth — drapeau Togo (identité locale) */
  hands: imgTogoFlag3d,
  carousel: [
    imgTogoFlag3d,
    imgFound,
    imgFound1,
    imgLost,
    imgTrouvTogo,
  ],
} as const

/** Visuels pages connexion / inscription (split image | formulaire) */
export const AUTH_IMAGES = {
  /** Confiance, retrouver un lien humain */
  login: LANDING_IMAGES.hands,
  /** Communauté, entrer dans le réseau */
  register: LANDING_IMAGES.community,
} as const
