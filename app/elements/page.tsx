import Link from 'next/link'
import { getAllElements, type Element } from '@/lib/elements'

export default function Elements() {
  const elements = getAllElements()

  return (
    <main className="min-h-screen py-14">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Catalogue des éléments
          </h1>
          <p className="text-gray-400 text-sm">
            {elements.length} élément{elements.length !== 1 ? 's' : ''} référencé{elements.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Empty state */}
        {elements.length === 0 && (
          <div className="max-w-lg border border-dashed border-gray-200 rounded-2xl px-8 py-16 text-center">
            <p className="text-gray-500 mb-2">Le catalogue est vide pour l&apos;instant.</p>
            <p className="text-sm text-gray-400">
              Revenez bientôt — le contenu est en cours d&apos;ajout.
            </p>
          </div>
        )}

        {/* Elements grid */}
        {elements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {elements.map((el: Element) => (
              <Link
                key={el.slug}
                href={`/elements/${el.slug}`}
                className="group flex flex-col gap-4 p-6 md:p-8 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all min-h-[180px]"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
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
                <h2 className="text-xl font-semibold text-gray-900 leading-snug">
                  {el.title || el.slug}
                </h2>

                {/* Famille if available */}
                {el.famille && (
                  <p className="text-sm text-gray-500">{el.famille}</p>
                )}

                {/* CTA */}
                <span className="text-xs text-gray-400 mt-auto group-hover:text-gray-700 transition-colors">
                  Voir la fiche →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
