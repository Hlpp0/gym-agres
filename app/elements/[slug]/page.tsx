import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getElementBySlug } from '@/lib/elements'
import { getAgreBySlug } from '@/lib/agres'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const element = getElementBySlug(slug)
  if (!element) return {}
  const title = element.frontmatter.title || slug
  return {
    title: `${title} — GETUMA`,
    description: `Fiche technique de ${title} (${element.agres}). Critères STV/FSG, décomposition du mouvement et conseils pédagogiques.`,
  }
}

export default async function ElementPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const element = getElementBySlug(slug)

  if (!element) return notFound()

  const agre = getAgreBySlug(element.agres)
  const agresLabel = agre?.label ?? element.agres

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link
          href={`/agres/${element.agres}`}
          className="hover:text-gray-700 transition-colors"
        >
          {agresLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-600">
          {element.frontmatter.title || element.slug}
        </span>
      </nav>

      {/* Meta badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {element.frontmatter.categorie && (
          <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {element.frontmatter.categorie}
          </span>
        )}
        {element.frontmatter.code_est && (
          <span className="text-xs text-gray-400">
            EST {element.frontmatter.code_est}
          </span>
        )}
        {element.frontmatter.code_stv && (
          <span className="text-xs text-gray-400">
            STV {element.frontmatter.code_stv}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-8">
        {element.frontmatter.title || element.slug}
      </h1>

      <div className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {element.content}
        </ReactMarkdown>
      </div>
    </main>
  )
}
