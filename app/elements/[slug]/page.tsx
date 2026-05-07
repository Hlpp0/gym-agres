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
        {/* Breadcrumb + Edit */}
        <div className="flex items-center justify-between mb-10">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
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
          <a
            href={`https://github.com/Hlpp0/gym-agres/edit/main/${element.filePath.split('/').map(encodeURIComponent).join('/')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Modifier
          </a>
        </div>

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
