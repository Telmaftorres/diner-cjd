// grise: true → la date reste affichée dans le formulaire mais grisée (non sélectionnable).
export const DATES: { id: string; label: string; sub: string; grise?: boolean }[] = [
  { id: '2026-10-01', label: 'Jeudi 1er octobre 2026', sub: '19h', grise: true },
  { id: '2026-11-05', label: 'Jeudi 5 novembre 2026',  sub: '19h', grise: true },
  { id: '2026-12-03', label: 'Jeudi 3 décembre 2026',  sub: '19h' },
  { id: '2027-01-07', label: 'Jeudi 7 janvier 2027',   sub: '19h' },
]

// Pas de limite d'inscriptions : c'est une pré-sélection, l'organisation
// choisit ensuite les 7 membres retenus pour chaque table.
