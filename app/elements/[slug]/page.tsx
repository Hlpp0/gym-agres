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
    <main className="min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/agres/${element.agres}`}
            className="hover:text-gray-700 transition-colors"
          >
            {agresLabel}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">
            {element.frontmatter.title || element.slug}
          </span>
        </nav>

        {/* Meta badges */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {element.frontmatter.categorie && (
            <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
              {element.frontmatter.categorie}
            </span>
          )}
          {element.frontmatter.code_est && (
            <span className="text-xs text-gray-400 font-mono">
              EST {element.frontmatter.code_est}
            </span>
          )}
          {element.frontmatter.code_stv && (
            <span className="text-xs text-gray-400 font-mono">
              STV {element.frontmatter.code_stv}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">
          {element.frontmatter.title || element.slug}
        </h1>

        <div className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {element.content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
