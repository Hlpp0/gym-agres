import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
      <Link href="/" className="font-bold text-lg tracking-tight">
        GETUMA
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/elements" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          Éléments
        </Link>
        <Link href="/a-propos" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          À propos
        </Link>
      </div>
    </nav>
  )
}