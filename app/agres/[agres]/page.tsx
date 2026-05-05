import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AGRES, getAgreBySlug } from '@/lib/agres'
import { getElementsByAgres } from '@/lib/elements'

export function generateStaticParams() {
  return AGRES.map(a => ({ agres: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agres: string }>
}): Promise<Metadata> {
  const { agres } = await params
  const agre = getAgreBySlug(agres)
  if (!agre) return {}
  return {
    title: `${agre.label} — GETUMA`,
    description: `Tous les éléments de ${agre.label.toLowerCase()} référencés dans le catalogue pédagogique GETUMA.`,
  }
}

export default async function AgresPage({
  params,
}: {
  params: Promise<{ agres: string }>
}) {
  const { agres } = await params
  const agre = getAgreBySlug(agres)

  if (!agre) notFound()

  const elements = getElementsByAgres(agres)

  return (
    <main className="min-h-screen px-6 py-14 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-gray-600">{agre.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{agre.label}</h1>
        {agre.subtitle && (
          <p className="text-gray-400 text-sm mb-3">{agre.subtitle}</p>
        )}
        <p className="text-gray-400 text-sm">
          {elements.length === 0
            ? 'Aucun élément pour l’instant'
            : `${elements.length} élément${elements.length > 1 ? 's' : ''} référencé${elements.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-2xl px-8 py-16 text-center">
          <p className="text-gray-500 mb-2">
            Aucun élément pour cet engin pour l&apos;instant.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Le catalogue est en cours de construction — revenez bientôt.
          </p>
          <Link
            href="/elements"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4"
          >
            Voir tous les éléments disponibles
          </Link>
        </div>
      )}

      {/* Elements grid */}
      {elements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {elements.map(el => (
            <Link
              key={el.slug}
              href={`/elements/${el.slug}`}
              className="group flex flex-col gap-4 p-6 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
                {el.categorie && (
                  <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {el.categorie}
                  </span>
                )}
                {el.code_est && (
                  <span className="text-xs text-gray-400 font-mono">
                    EST&nbsp;{el.code_est}
                  </span>
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
