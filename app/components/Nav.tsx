'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-gray-900 font-medium'
        : 'text-gray-400 hover:text-gray-900'
    }`

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
      <Link href="/" className="font-bold text-lg tracking-tight">
        GETUMA
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/elements" className={linkClass('/elements')}>
          Éléments
        </Link>
        <Link href="/a-propos" className={linkClass('/a-propos')}>
          À propos
        </Link>
      </div>
    </nav>
  )
}
