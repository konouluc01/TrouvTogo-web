/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  /** Marque (affichage, métadonnées) */
  readonly VITE_APP_NAME?: string
  /** Base URL API Spring, sans slash final. Vide = requêtes relatives /api (proxy en dev). */
  readonly VITE_API_URL?: string
  /** Remplace la vidéo hero locale si défini */
  readonly VITE_HERO_VIDEO_URL?: string
  /** Cible du proxy Vite en dev (vite.config) */
  readonly VITE_PROXY_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
