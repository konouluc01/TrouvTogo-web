/**
 * Libellés français pour les codes catégorie renvoyés par l’API (`nom`).
 * Quand le backend envoie déjà `description` (ex. seed SQL), on l’affiche en priorité via `libelleCategorie`.
 */
export const CATEGORIE_LIBELLES_FR: Record<string, string> = {
  PHONE: 'Téléphones et accessoires',
  IDENTITY_PAPERS: "Papiers d'identité",
  KEYS: 'Clés',
  LUGGAGE: 'Bagages',
  WALLET: 'Portefeuilles',
  ELECTRONICS: 'Électronique',
  JEWELRY: 'Bijoux',
  CLOTHING: 'Vêtements',
  PETS: 'Animaux',
  BOOKS: 'Livres',
  OTHER: 'Autre',
}

function libelleDepuisCodeTechnique(nom: string): string {
  const k = nom.trim().toUpperCase()
  if (CATEGORIE_LIBELLES_FR[k]) return CATEGORIE_LIBELLES_FR[k]
  return nom
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Affiche le libellé utilisateur : description API si présente, sinon table FR, sinon dérivation du code. */
export function libelleCategorie(
  nomTechnique: string | null | undefined,
  descriptionApi?: string | null,
): string {
  const d = descriptionApi?.trim()
  if (d) return d
  if (!nomTechnique?.trim()) return '—'
  return libelleDepuisCodeTechnique(nomTechnique)
}
