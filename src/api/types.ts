/** Aligné sur les enums Java du backend */

export type TypeObjet = 'PERDU' | 'TROUVE'

export type StatutObjet = 'ACTIF' | 'RESOLU' | 'ARCHIVE'

/** Aligné sur {@code ConservationTrouvaille} côté API */
export type ConservationTrouvaille = 'CHEZ_MOI' | 'DEPOSE_STRUCTURE'

export type TypeLieuDepot = 'COMMISSARIAT' | 'GENDARMERIE' | 'MAIRIE' | 'AUTRE'

export type Role = 'ROLE_USER' | 'ROLE_ADMIN'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface AuthPayload {
  token: string
  type?: string
  id: number
  username: string
  email: string
  telephone?: string | null
  role: Role
}

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  username: string
  email: string
  password: string
  telephone?: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  telephone?: string | null
  role: Role
  createdAt?: string
}

export interface UpdateProfileBody {
  username: string
  email: string
  telephone?: string
}

export interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

export interface ObjetPayload {
  titre: string
  description?: string
  type: TypeObjet
  localisation?: string
  /** Point WGS84 (annonce « trouvé »), les deux ou aucun. */
  latitude?: number | null
  longitude?: number | null
  dateEvenement?: string | null
  categorieId?: number | null
  /** Obligatoire si `type === 'TROUVE'`. */
  conservationTrouve?: ConservationTrouvaille | null
  /** Obligatoire si `conservationTrouve === 'DEPOSE_STRUCTURE'`. */
  lieuDepotId?: number | null
  photosUrls?: string[]
  /**
   * Objets perdus uniquement : montant de remise pour le retrouveur (FCFA), optionnel.
   * À envoyer `null` ou omettre si pas de remise ou si type « trouvé ».
   */
  remiseMontant?: number | null
}

export interface Objet {
  id: number
  titre: string
  description?: string
  type: TypeObjet
  statut: StatutObjet
  localisation?: string
  latitude?: number | null
  longitude?: number | null
  dateEvenement?: string | null
  categorieNom?: string | null
  categorieDescription?: string | null
  categorieId?: number | null
  proprietaireUsername?: string | null
  proprietaireId?: number | null
  photosUrls?: string[]
  createdAt?: string
  updatedAt?: string
  conservationTrouve?: ConservationTrouvaille | null
  lieuDepotId?: number | null
  lieuDepotTypeLieu?: TypeLieuDepot | null
  lieuDepotNom?: string | null
  lieuDepotAdresse?: string | null
  lieuDepotVille?: string | null
  lieuDepotTelephone?: string | null
  lieuDepotIndication?: string | null
  /** Montant de remise proposé (FCFA), uniquement pour les annonces « perdu ». */
  remiseMontant?: number | null
}

/** Spring Data Page JSON */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface Categorie {
  id: number
  nom: string
  description?: string | null
}

export interface CommunauteStats {
  personnesActives: number
}

export interface TimeSeriesPoint {
  key: string
  name: string
  lost: number
  found: number
  resolved: number
}

export interface MessagePayload {
  destinataireId: number
  contenu: string
  objetId?: number | null
}

export interface Message {
  id: number
  contenu: string
  lu: boolean
  expediteurId: number
  expediteurUsername?: string | null
  destinataireId: number
  destinataireUsername?: string | null
  objetId?: number | null
  objetTitre?: string | null
  createdAt?: string
}

export interface ConversationLastMessage {
  content: string
  createdAt: string
  isFromMe: boolean
}

export interface ConversationUser {
  id: number
  name: string
  avatarUrl?: string | null
}

export interface Conversation {
  id: number
  itemId?: number | null
  item?: Objet | null
  otherUserId: number
  otherUser: ConversationUser
  lastMessage?: ConversationLastMessage | null
  unreadCount: number
  matchScore: number
  updatedAt?: string
}

/** Réponse API admin — signalement d’annonce */
export interface Signalement {
  id: number
  objetId: number
  objetTitre?: string | null
  reporterId: number
  reporterUsername?: string | null
  message?: string | null
  resolved: boolean
  resolverId?: number | null
  resolverUsername?: string | null
  createdAt?: string
  resolvedAt?: string | null
}

export interface SignalementPayload {
  message: string
}

export interface CategoriePayload {
  nom: string
  description?: string
}

export interface LieuDepot {
  id: number
  typeLieu: TypeLieuDepot
  nom: string
  adresse?: string | null
  ville?: string | null
  telephone?: string | null
  indication?: string | null
  actif: boolean
}

export interface LieuDepotPayload {
  typeLieu: TypeLieuDepot
  nom: string
  adresse?: string
  ville?: string
  telephone?: string
  indication?: string
  actif?: boolean
}
