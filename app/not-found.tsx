import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-200 mb-6 select-none">404</p>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Cette page est partie à l'entraînement.
        </h1>
        <p className="text-gray-500 mb-10">
          Elle revient au plus vite. En attendant, retrouve les éléments par ici.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Accueil
          </Link>
          <Link
            href="/elements"
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Catalogue
          </Link>
        </div>
      </div>
    </main>
  )
}
