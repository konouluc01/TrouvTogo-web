const xofFormatter = new Intl.NumberFormat('fr-TG', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
})

/** Affiche un montant en franc CFA (objets perdus — remise). */
export function formatMontantXof(amount: number): string {
  return xofFormatter.format(amount)
}

/** Chaîne saisie → montant entier FCFA, ou null si vide / invalide. */
export function parseRemiseMontantInput(raw: string): number | null | 'invalid' {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t.replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return 'invalid'
  return Math.floor(n)
}
