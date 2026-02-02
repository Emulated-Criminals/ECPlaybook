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

const CATEGORY_PRIORITY_FILE = 'category-priority.json'

type CategoryPriorityMap = Record<string, number>

const resolveCategoryPriorityPath = () => {
  const fromCwd = path.join(process.cwd(), CATEGORY_PRIORITY_FILE)
  if (fs.existsSync(fromCwd)) {
    return fromCwd
  }
  const fromContent = path.join(resolveContentDirectory(), CATEGORY_PRIORITY_FILE)
  if (fs.existsSync(fromContent)) {
    return fromContent
  }
  return null
}

function loadCategoryPriorities(): CategoryPriorityMap {
  const priorityPath = resolveCategoryPriorityPath()
  if (!priorityPath) {
    return {}
  }
  try {
    const raw = fs.readFileSync(priorityPath, 'utf8')
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') {
      return {}
    }
    const result: CategoryPriorityMap = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = value
      }
    }
    return result
  } catch (error) {
    console.warn('[cheatsheets] Failed to load category priorities:', error)
    return {}
  }
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

  const priorities = loadCategoryPriorities()
  return Array.from(categories).sort((a, b) => {
    const aPriority = priorities[a] ?? Number.POSITIVE_INFINITY
    const bPriority = priorities[b] ?? Number.POSITIVE_INFINITY
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    return a.localeCompare(b, undefined, { sensitivity: 'base' })
  })
}
