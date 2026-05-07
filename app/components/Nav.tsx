'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 10) {
        setVisible(true)
      } else if (y < lastScrollY.current) {
        setVisible(true)
      } else {
        setVisible(false)
      }
      lastScrollY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-gray-900 font-medium'
        : 'text-gray-400 hover:text-gray-900'
    }`

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
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
