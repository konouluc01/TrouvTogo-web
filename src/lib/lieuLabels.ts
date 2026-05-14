import type { ConservationTrouvaille, TypeLieuDepot } from '../api/types'

const TYPE_LIEU: Record<TypeLieuDepot, string> = {
  COMMISSARIAT: 'Commissariat',
  GENDARMERIE: 'Gendarmerie',
  MAIRIE: 'Mairie',
  AUTRE: 'Autre',
}

export function libelleTypeLieu(t: TypeLieuDepot): string {
  return TYPE_LIEU[t] ?? t
}

export function libelleConservation(c: ConservationTrouvaille): string {
  return c === 'CHEZ_MOI'
    ? 'Conservé par le trouveur'
    : 'Déposé dans une structure référencée'
}
