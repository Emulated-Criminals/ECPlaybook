export interface Section {
  id: string
  title: string
  cards: Card[]
}

export interface Card {
  id: string
  title: string
  content: string
  isCodeOnly: boolean
  hasFooter: boolean
  classes?: string
}

export function parseMarkdownContent(markdown: string): Section[] {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentCard: Card | null = null
  let currentContent: string[] = []
  let inCodeBlock = false

  const createId = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const finishCard = () => {
    if (currentCard && currentContent.length > 0) {
      currentCard.content = currentContent.join('\n').trim()
      
      // Check if the last line is plain text (not in code block)
      const contentLines = currentCard.content.split('\n')
      let lastNonEmptyLine = ''
      let isLastLineCode = false
      
      for (let i = contentLines.length - 1; i >= 0; i--) {
        const line = contentLines[i].trim()
        if (line) {
          lastNonEmptyLine = line
          // Check if we're in a code block at the end
          const codeBlocksInContent = currentCard.content.match(/```/g)
          isLastLineCode = codeBlocksInContent && codeBlocksInContent.length % 2 === 0
          break
        }
      }
      
      // If last non-empty line is not code and not empty, it should have footer styling
      currentCard.hasFooter = !isLastLineCode && 
                              lastNonEmptyLine.length > 0 && 
                              !lastNonEmptyLine.startsWith('```')
      
      currentSection?.cards.push(currentCard)
      currentContent = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      currentContent.push(line)
      continue
    }

    // H2 - Section
    if (line.startsWith('## ') && !inCodeBlock) {
      finishCard()
      currentCard = null
      
      const title = line.replace('## ', '').trim()
      currentSection = {
        id: createId(title),
        title,
        cards: [],
      }
      sections.push(currentSection)
      continue
    }

    // H3 - Card
    if (line.startsWith('### ') && !inCodeBlock) {
      finishCard()
      
      let title = line.replace('### ', '').trim()
      let classes = ''
      
      // Extract classes like {.row-span-2}
      const classMatch = title.match(/\{\.([^}]+)\}/)
      if (classMatch) {
        classes = classMatch[1]
        title = title.replace(/\{\.([^}]+)\}/, '').trim()
      }
      
      currentCard = {
        id: createId(title),
        title,
        content: '',
        isCodeOnly: false,
        hasFooter: false,
        classes,
      }
      currentContent = []
      continue
    }

    // Add content to current card
    if (currentCard) {
      currentContent.push(line)
    }
  }

  // Finish the last card
  finishCard()

  return sections
}

export function renderMarkdownToHTML(content: string): string {
  let html = content

  // Code blocks with syntax highlighting placeholder
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block" data-lang="${lang || 'text'}"><code>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-:\s|]+\|\n(((?:\|.+\|\n?)+))/g, (match) => {
    const lines = match.trim().split('\n')
    const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim())
    const rows = lines.slice(2).map(row =>
      row.split('|').filter(c => c.trim()).map(c => c.trim())
    )

    let table = '<table class="markdown-table"><thead><tr>'
    headers.forEach(h => {
      table += `<th>${h}</th>`
    })
    table += '</tr></thead><tbody>'
    rows.forEach(row => {
      table += '<tr>'
      row.forEach(cell => {
        table += `<td>${cell}</td>`
      })
      table += '</tr>'
    })
    table += '</tbody></table>'
    return table
  })

  // Paragraphs
  html = html
    .split('\n\n')
    .map(para => {
      para = para.trim()
      if (
        para.startsWith('<pre') ||
        para.startsWith('<table') ||
        para.startsWith('<code')
      ) {
        return para
      }
      return para ? `<p>${para}</p>` : ''
    })
    .join('\n')

  return html
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
