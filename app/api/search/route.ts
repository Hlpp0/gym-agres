import { NextRequest, NextResponse } from 'next/server'
import { getAllElements } from '@/lib/elements'
import { AGRES } from '@/lib/agres'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const agresLabels = Object.fromEntries(AGRES.map(a => [a.slug, a.label.toLowerCase()]))

  const results = getAllElements()
    .filter(el => {
      const title = (el.title ?? el.slug).toLowerCase()
      const code = (el.code_est ?? '').toLowerCase()
      const agres = el.agres.toLowerCase()
      const agresLabel = agresLabels[el.agres] ?? ''
      return title.includes(q) || code.includes(q) || agres.includes(q) || agresLabel.includes(q)
    })
    .slice(0, 8)
    .map(el => ({
      slug: el.slug,
      title: el.title ?? el.slug,
      agres: el.agres,
      categorie: el.categorie,
      code_est: el.code_est,
    }))

  return NextResponse.json(results)
}
