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
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-gray-600">{agre.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">{agre.label}</h1>
        {agre.subtitle && (
          <p className="text-gray-400 text-sm mb-3">{agre.subtitle}</p>
        )}
        <p className="text-gray-500 text-sm">
          {elements.length === 0
            ? 'Aucun élément pour cet engin pour l\'instant'
            : `${elements.length} élément${elements.length > 1 ? 's' : ''} référencé${elements.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-base mb-2">Aucun élément pour cet engin pour l&apos;instant.</p>
          <p className="text-sm">Revenez bientôt — le catalogue est en cours de construction.</p>
          <Link
            href="/elements"
            className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-4"
          >
            Voir tous les éléments disponibles
          </Link>
        </div>
      )}

      {/* Elements grid */}
      {elements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {elements.map(el => (
            <Link
              key={el.slug}
              href={`/elements/${el.slug}`}
              className="flex flex-col gap-3 p-5 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {el.categorie && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {el.categorie}
                  </span>
                )}
                {el.code_est && (
                  <span className="text-xs text-gray-400">EST {el.code_est}</span>
                )}
              </div>
              <p className="font-semibold text-gray-900 leading-snug">
                {el.title || el.slug}
              </p>
              <p className="text-xs text-gray-400 mt-auto">Voir la fiche →</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
