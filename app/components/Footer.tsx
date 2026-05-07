import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 py-8 px-8">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} GETUMA — Projet indépendant, Suisse</span>
        <nav className="flex items-center gap-6">
          <Link href="/mentions-legales" className="hover:text-gray-700 transition-colors">
            Mentions légales
          </Link>
          <Link href="/politique-de-confidentialite" className="hover:text-gray-700 transition-colors">
            Confidentialité
          </Link>
          <Link href="/a-propos" className="hover:text-gray-700 transition-colors">
            À propos
          </Link>
        </nav>
      </div>
    </footer>
  )
}
