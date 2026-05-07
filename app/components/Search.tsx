'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AGRES } from '@/lib/agres'

type Result = {
  slug: string
  title: string
  agres: string
  categorie?: string
  code_est?: string
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data: Result[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus mobile input when bar opens
  useEffect(() => {
    if (mobileOpen) mobileInputRef.current?.focus()
  }, [mobileOpen])

  function close() {
    setOpen(false)
    setMobileOpen(false)
    setQuery('')
    setResults([])
  }

  function navigate(slug: string) {
    close()
    router.push(`/elements/${slug}`)
  }

  function agreLabel(slug: string) {
    return AGRES.find(a => a.slug === slug)?.label ?? slug
  }

  const Dropdown = () =>
    open && results.length > 0 ? (
      <ul className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
        {results.map(r => (
          <li key={r.slug}>
            <button
              onClick={() => navigate(r.slug)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3"
            >
              <span className="text-sm text-gray-800 leading-snug line-clamp-2">{r.title}</span>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full whitespace-nowrap">
                  {agreLabel(r.agres)}
                </span>
                {r.categorie && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {r.categorie}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    ) : null

  return (
    <div ref={containerRef} className="relative">
      {/* Mobile: loupe icon → fixed bar below nav */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Rechercher"
        className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <SearchIcon />
      </button>

      {/* Mobile search bar — fixed below nav */}
      {mobileOpen && (
        <div className="md:hidden fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-3">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un élément..."
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <button
              onClick={close}
              aria-label="Fermer la recherche"
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              <CloseIcon />
            </button>
          </div>
          {open && results.length > 0 && (
            <ul className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
              {results.map(r => (
                <li key={r.slug}>
                  <button
                    onClick={() => navigate(r.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 bg-white"
                  >
                    <span className="text-sm text-gray-800 leading-snug line-clamp-2">{r.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full whitespace-nowrap">
                        {agreLabel(r.agres)}
                      </span>
                      {r.categorie && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          {r.categorie}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Desktop: inline input + dropdown */}
      <div className="hidden md:block relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-44 text-sm bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-gray-400 focus:w-56 transition-all duration-200"
        />
        <Dropdown />
      </div>
    </div>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
