import type { Metadata } from 'next'
import Link from 'next/link'
import { AGRES } from '@/lib/agres'
import { getAllElements, getRecentElements } from '@/lib/elements'

export const metadata: Metadata = {
  title: 'GETUMA — La référence de la gymnastique aux agrès en Suisse',
  description:
    'Fiches techniques, critères STV/FSG et ressources pédagogiques pour tous les agrès de la gymnastique artistique suisse.',
}

export default function Home() {
  const allElements = getAllElements()
  const recent = getRecentElements(5)

  const countByAgres = allElements.reduce<Record<string, number>>((acc, el) => {
    acc[el.agres] = (acc[el.agres] || 0) + 1
    return acc
  }, {})

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 border-b border-gray-100">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">
          GETUMA
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 mb-6 font-medium max-w-xl">
          La référence de la gymnastique aux agrès en Suisse
        </p>
        <p className="text-gray-400 max-w-md mb-10 leading-relaxed text-sm md:text-base">
          Fiches techniques, critères STV/FSG et ressources pédagogiques pour
          entraîneurs et gymnastes. De la bougie au salto, maîtrisez chaque
          mouvement.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/elements"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Parcourir le catalogue
          </Link>
          <Link
            href="/a-propos"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            En savoir plus
          </Link>
        </div>
      </section>

      {/* Choisir un engin */}
      <section className="px-6 py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Choisir un engin</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {AGRES.map(agre => {
              const count = countByAgres[agre.slug] || 0
              return (
                <Link
                  key={agre.slug}
                  href={`/agres/${agre.slug}`}
                  className={`flex flex-col items-center justify-center gap-1 p-5 border rounded-2xl transition-all text-center ${agre.color}`}
                >
                  <span className="font-semibold text-gray-800 leading-tight text-sm">
                    {agre.label}
                  </span>
                  {agre.subtitle && (
                    <span className="text-xs text-gray-400">{agre.subtitle}</span>
                  )}
                  <span className="text-xs text-gray-400 mt-1">
                    {count}&nbsp;élément{count !== 1 ? 's' : ''}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Derniers éléments */}
      {recent.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-bold">Derniers éléments ajoutés</h2>
              <Link
                href="/elements"
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                Voir tout →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {recent.map(el => (
                <Link
                  key={el.slug}
                  href={`/elements/${el.slug}`}
                  className="snap-start shrink-0 w-52 p-5 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {el.agres}
                    </span>
                    {el.categorie && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{el.categorie}</span>
                      </>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 leading-snug">
                    {el.title || el.slug}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">Voir la fiche →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
