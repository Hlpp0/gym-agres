import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/elements')

export interface Element {
  slug: string
  agres: string
  title?: string
  categorie?: string
  famille?: string
  code_est?: string
  code_stv?: string
  url_stv?: string
}

const COMBINING_MARKS = /\p{M}/gu

export function normalizeSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function convertWikilinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
    const slug = normalizeSlug(name)
    return `[${name}](/elements/${slug})`
  })
}

function convertCallouts(content: string): string {
  return content.replace(
    /^>\s*\[!(note|info|warning|tip|important|danger)\]\s*(.*)$/gim,
    (_, type, title) => {
      const emoji: Record<string, string> = {
        note: '📝',
        info: 'ℹ️',
        warning: '⚠️',
        tip: '💡',
        important: '❗',
        danger: '🚨',
      }
      return `**${emoji[type] ?? '📝'} ${title || type.toUpperCase()}**`
    }
  )
}

function readElementsFromDir(agrePath: string, agreName: string): Element[] {
  if (!fs.existsSync(agrePath) || !fs.statSync(agrePath).isDirectory()) return []
  return fs
    .readdirSync(agrePath)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(agrePath, file), 'utf-8')
      const { data } = matter(raw)
      return {
        slug: normalizeSlug(file.replace('.md', '')),
        agres: agreName,
        ...data,
      } as Element
    })
}

export function getAllElements(): Element[] {
  if (!fs.existsSync(contentDir)) return []
  return fs
    .readdirSync(contentDir)
    .filter(entry => fs.statSync(path.join(contentDir, entry)).isDirectory())
    .flatMap(agre => readElementsFromDir(path.join(contentDir, agre), agre))
}

export function getElementsByAgres(agresSlug: string): Element[] {
  const normalized = agresSlug.toLowerCase()
  return readElementsFromDir(path.join(contentDir, normalized), normalized)
    .sort((a, b) => (a.title ?? a.slug).localeCompare(b.title ?? b.slug, 'fr'))
}

export function getRecentElements(limit = 5): Element[] {
  if (!fs.existsSync(contentDir)) return []

  const withMtime: Array<Element & { mtimeMs: number }> = fs
    .readdirSync(contentDir)
    .filter(entry => fs.statSync(path.join(contentDir, entry)).isDirectory())
    .flatMap(agre => {
      const agrePath = path.join(contentDir, agre)
      return fs
        .readdirSync(agrePath)
        .filter(f => f.endsWith('.md'))
        .map(file => {
          const filePath = path.join(agrePath, file)
          const raw = fs.readFileSync(filePath, 'utf-8')
          const { data } = matter(raw)
          const { mtimeMs } = fs.statSync(filePath)
          return {
            slug: normalizeSlug(file.replace('.md', '')),
            agres: agre,
            mtimeMs,
            ...data,
          } as Element & { mtimeMs: number }
        })
    })

  return withMtime
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, limit)
}

export function getElementBySlug(slug: string) {
  if (!fs.existsSync(contentDir)) return null

  for (const agre of fs.readdirSync(contentDir)) {
    const agrePath = path.join(contentDir, agre)
    if (!fs.statSync(agrePath).isDirectory()) continue
    for (const file of fs.readdirSync(agrePath).filter(f => f.endsWith('.md'))) {
      if (normalizeSlug(file.replace('.md', '')) === normalizeSlug(slug)) {
        const filePath = path.join(agrePath, file)
        const raw = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(raw)
        const processed = convertCallouts(convertWikilinks(content))
        return { slug, agres: agre, frontmatter: data, content: processed }
      }
    }
  }

  return null
}
