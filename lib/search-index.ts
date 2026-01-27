import { getAllCheatsheets } from '@/lib/markdown'
import { resolveIconPath } from '@/lib/icon-path'
import { parseMarkdownContent } from '@/lib/markdown-parser'

export interface SearchSectionHeading {
  title: string
  anchor: string
}

export interface SearchSection {
  h2: SearchSectionHeading
  h3: SearchSectionHeading[]
}

export interface SearchDocument {
  slug: string
  title: string
  path: string
  icon: string
  background: string
  intro: string
  categories: string[]
  tags: string[]
  sections: SearchSection[]
}

const buildAnchor = (sectionId: string, cardId?: string) =>
  `#${cardId ? `${sectionId}-${cardId}` : sectionId}`

export function buildSearchIndex(): SearchDocument[] {
  const cheatsheets = getAllCheatsheets()

  return cheatsheets.map((sheet) => {
    const sections = parseMarkdownContent(sheet.content).map((section) => ({
      h2: {
        title: section.title,
        anchor: buildAnchor(section.id)
      },
      h3: section.cards.map((card) => ({
        title: card.title,
        anchor: buildAnchor(section.id, card.id)
      }))
    }))

    return {
      slug: sheet.slug,
      title: sheet.metadata.title,
      path: `/${sheet.slug}`,
      icon: resolveIconPath(sheet.slug, sheet.metadata.icon),
      background: sheet.metadata.background,
      intro: sheet.metadata.intro,
      categories: sheet.metadata.categories || [],
      tags: sheet.metadata.tags || [],
      sections
    }
  })
}
