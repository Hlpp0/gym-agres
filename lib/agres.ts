export interface Agre {
  slug: string
  label: string
  subtitle?: string
  color: string
}

export const AGRES: Agre[] = [
  {
    slug: 'sol',
    label: 'Sol',
    color: 'bg-sky-50 border-sky-100 hover:border-sky-400',
  },
  {
    slug: 'saut',
    label: 'Saut',
    color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-400',
  },
  {
    slug: 'anneaux',
    label: 'Anneaux',
    color: 'bg-purple-50 border-purple-100 hover:border-purple-400',
  },
  {
    slug: 'reck',
    label: 'Reck',
    subtitle: 'Barre fixe',
    color: 'bg-amber-50 border-amber-100 hover:border-amber-400',
  },
  {
    slug: 'barres-paralleles',
    label: 'Barres parallèles',
    color: 'bg-rose-50 border-rose-100 hover:border-rose-400',
  },
  {
    slug: 'barres-asymetriques',
    label: 'Barres asymétriques',
    color: 'bg-teal-50 border-teal-100 hover:border-teal-400',
  },
]

export function getAgreBySlug(slug: string): Agre | undefined {
  return AGRES.find(a => a.slug === slug)
}
