import Link from 'next/link'
import { getAllElements, type Element } from '@/lib/elements'

export default function Elements() {
  const elements = getAllElements()

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Catalogue des éléments</h1>
      <div className="grid grid-cols-1 gap-4">
        {elements.map((el: Element) => (
          <Link key={el.slug}
            href={`/elements/${el.slug}`}
            className="block p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 uppercase">{el.agres}</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-400">{el.categorie}</span>
            </div>
            <h2 className="text-xl font-semibold mt-1">{el.title || el.slug}</h2>
          </Link>
        ))}
      </div>
    </main>
  )
}