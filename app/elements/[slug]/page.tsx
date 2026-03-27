import { getElementBySlug } from '@/lib/elements'
import { notFound } from 'next/navigation'

export default function ElementPage({ params }: { params: { slug: string } }) {
  const element = getElementBySlug(params.slug)

  if (!element) return notFound()

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-400 uppercase">{element.agres}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm font-medium text-gray-600">{element.frontmatter.categorie}</span>
      </div>
      <h1 className="text-4xl font-bold mb-8">
        {element.frontmatter.title || element.slug}
      </h1>
      <div className="prose prose-gray max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {element.content}
        </pre>
      </div>
    </main>
  )
}