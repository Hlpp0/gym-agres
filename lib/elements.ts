import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/elements')

// Récupère tous les éléments de tous les agrès
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
        slug: file.replace('.md', ''),
        agres: agre,
        ...data,
      })
    }
  }

  return elements
}

// Récupère un élément par son slug
export function getElementBySlug(slug: string) {
  const agres = fs.readdirSync(contentDir)

  for (const agre of agres) {
    const filePath = path.join(contentDir, agre, `${slug}.md`)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      return { slug, agres: agre, frontmatter: data, content }
    }
  }

  return null
}