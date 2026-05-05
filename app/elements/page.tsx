import Link from 'next/link'
import { getAllElements, type Element } from '@/lib/elements'

export default function Elements() {
  const elements = getAllElements()

  return (
    <main className="min-h-screen px-6 py-14 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Catalogue des éléments
        </h1>
        <p className="text-gray-400 text-sm">
          {elements.length} élément{elements.length !== 1 ? 's' : ''} référencé{elements.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-2xl px-8 py-16 text-center">
          <p className="text-gray-500 mb-2">Le catalogue est vide pour l&apos;instant.</p>
          <p className="text-sm text-gray-400">Revenez bientôt — le contenu est en cours d&apos;ajout.</p>
        </div>
      )}

      {/* Elements list */}
      {elements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {elements.map((el: Element) => (
            <Link
              key={el.slug}
              href={`/elements/${el.slug}`}
              className="group flex flex-col gap-4 p-6 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {el.agres}
                </span>
                {el.categorie && (
                  <>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {el.categorie}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                {el.title || el.slug}
              </h2>

              {/* Famille if available */}
              {el.famille && (
                <p className="text-sm text-gray-500 -mt-2">{el.famille}</p>
              )}

              {/* CTA */}
              <span className="text-xs text-gray-400 mt-auto group-hover:text-gray-700 transition-colors">
                Voir la fiche →
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
