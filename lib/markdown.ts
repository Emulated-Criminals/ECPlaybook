import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const resolveContentDirectory = () => {
  const fromCwd = path.join(process.cwd(), 'content')
  if (fs.existsSync(fromCwd)) {
    return fromCwd
  }
  // Fallbacks relative to compiled file location (helps if cwd shifts in dev/server)
  const candidatePaths = [
    path.resolve(__dirname, '..', 'content'),
    path.resolve(__dirname, '..', '..', 'content'),
    path.resolve(__dirname, '..', '..', '..', 'content')
  ]
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return fromCwd
}

export interface CheatsheetMetadata {
  title: string
  date: string
  background: string
  icon?: string
  iconSize?: number
  tags: string[]
  categories: string[]
  intro: string
  plugins?: string[]
}

export interface Cheatsheet {
  slug: string
  metadata: CheatsheetMetadata
  content: string
}

export function getAllCheatsheets(): Cheatsheet[] {
  const contentDirectory = resolveContentDirectory()
  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(contentDirectory)
  const cheatsheets = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(contentDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        metadata: data as CheatsheetMetadata,
        content,
      }
    })

  return cheatsheets
}

export function getCheatsheetBySlug(slug: string): Cheatsheet | null {
  const contentDirectory = resolveContentDirectory()
  const fullPath = path.join(contentDirectory, `${slug}.md`)
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      metadata: data as CheatsheetMetadata,
      content
    }
  } catch (error) {
    console.error(`[cheatsheets] Failed to load "${slug}" from ${fullPath}:`, error)
    return null
  }
}

export function getCheatsheetsByCategory(category: string): Cheatsheet[] {
  const allCheatsheets = getAllCheatsheets()
  return allCheatsheets.filter(sheet =>
    sheet.metadata.categories.includes(category)
  )
}

export function getAllCategories(): string[] {
  const allCheatsheets = getAllCheatsheets()
  const categories = new Set<string>()
  
  allCheatsheets.forEach(sheet => {
    sheet.metadata.categories.forEach(cat => categories.add(cat))
  })
  
  return Array.from(categories)
}
