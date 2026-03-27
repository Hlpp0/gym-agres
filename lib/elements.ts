import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/elements')

function convertWikilinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    return `[${name}](/elements/${slug})`
  })
}

export function getAllElements() {
  const agres = fs.readdirSync(contentDir)
  const elements: any[] = []

  for (const agre of agres) {
    const agrePath = path.join(contentDir, agre)
    const files = fs.readdirSync(agrePath).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = path.join(agrePath, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)
      elements.push({
        slug: file.replace('.md', '').toLowerCase(),
        agres: agre,
        ...data,
      })
    }
  }

  return elements
}

export function getElementBySlug(slug: string) {
  const agres = fs.readdirSync(contentDir)

  for (const agre of agres) {
    const agrePath = path.join(contentDir, agre)
    const files = fs.readdirSync(agrePath).filter(f => f.endsWith('.md'))
    
    for (const file of files) {
      if (file.replace('.md', '').toLowerCase() === slug.toLowerCase()) {
        const filePath = path.join(agrePath, file)
        const raw = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(raw)
        return { slug, agres: agre, frontmatter: data, content: convertWikilinks(content) }
      }
    }
  }

  return null
}