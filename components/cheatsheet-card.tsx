'use client'

import { useState } from 'react'
import { Card as CardType } from '@/lib/markdown-parser'
import { Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { registerNmapLanguage } from '@/lib/nmap-language'
import { registerMsfLanguage } from '@/lib/msf-language'

interface CheatsheetCardProps {
  card: CardType
}

const syntaxTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: '#0d1117'
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    color: '#c9d1d9'
  },
  keyword: {
    ...vscDarkPlus.keyword,
    color: '#875ae0'
  },
  builtin: {
    ...vscDarkPlus.builtin,
    color: '#875ae0'
  },
  function: {
    ...vscDarkPlus.function,
    color: '#875ae0'
  },
  comment: {
    ...vscDarkPlus.comment,
    color: '#3AD29F'
  },
  'class-name': {
    ...vscDarkPlus['class-name'],
    color: '#bfa4ff'
  },
  command: {
    color: '#875ae0'
  },
  option: {
    color: '#F42C44'
  },
  target: {
    color: vscDarkPlus.comment?.color || '#6A9955'
  }
}

registerNmapLanguage()
registerMsfLanguage()

export function CheatsheetCard({ card }: CheatsheetCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderContent = () => {
    let html = card.content

    // Handle code blocks with copy button
    const codeBlocks: { lang: string; code: string; id: string; wrap: boolean }[] = []
    let codeBlockCounter = 0
    let footerText = ''

    const formatInline = (source: string) => {
      let output = source
      const backtickToken = '__ESCAPED_BACKTICK__'
      output = output.replace(/\\`/g, backtickToken)
      // Bold + italic
      output = output.replace(/\*\*_([^_]+)_\*\*/g, '<strong class="font-semibold text-foreground"><em>$1</em></strong>')
      // Markdown links
      output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
        const trimmed = String(href).trim()
        if (trimmed.startsWith('#')) {
          return `<a href="${trimmed}" class="text-[#875ae0] hover:underline">${text}</a>`
        }
        return `<a href="${trimmed}" class="text-[#875ae0] hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`
      })
      // Inline code
      output = output.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-code-bg rounded text-accent font-mono text-sm">$1</code>')
      // Bold
      output = output.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Italic (avoid underscores inside words, e.g. PID_TO_IMPERSONATE)
      output = output.replace(/(^|[^\w])_([^_]+)_([^\w]|$)/g, (_match, lead, text, trail) => {
        return `${lead}<em>${text}</em>${trail}`
      })
      output = output.replace(new RegExp(backtickToken, 'g'), '`')
      return output
    }

    html = html.replace(/```(\w+)?(?:\s*\{([^}]+)\})?\s*\r?\n([\s\S]*?)```/g, (_, lang, attrs, code) => {
      const id = `${card.id}-code-${codeBlockCounter++}`
      const trimmedCode = code.trim()
      const wrap = typeof attrs === 'string' && /\B\.wrap\b/.test(attrs)
      codeBlocks.push({ lang: lang || 'text', code: trimmedCode, id, wrap })
      return `@@CODEBLOCK:${id}@@`
    })

    const extractFooterLine = () => {
      const lines = html.split('\n')
      const footerLines: string[] = []
      let cutoffIndex = -1

      for (let i = lines.length - 1; i >= 0; i--) {
        const rawLine = lines[i]
        const trimmed = rawLine.trim()

        if (!trimmed) {
          continue
        }
        if (trimmed.includes('@@CODEBLOCK:')) {
          break
        }
        if (!trimmed.startsWith('See:')) {
          break
        }
        footerLines.unshift(trimmed)
        cutoffIndex = i
      }

      if (footerLines.length === 0 || cutoffIndex === -1) {
        return
      }

      footerText = footerLines.map(line => formatInline(line)).join('<br />')
      html = lines.slice(0, cutoffIndex).join('\n')
    }

    extractFooterLine()

    // Subheadings (H4)
    html = html.replace(/^####\s+(.+)$/gm, '<div class="text-xs uppercase tracking-wide text-white/70 font-semibold mt-3">$1</div>')

    // Separator lines
    html = html.replace(/^\s*---\s*$/gm, '<div class="card-separator my-3"></div>')

    // Tables
    html = html.replace(/(?:^|\n)\s*\|(.+)\|\r?\n\s*\|[-:\s|]+\|\r?\n((?:\s*\|.+\|\r?\n?)*)/g, (match) => {
      const lines = match.trim().split(/\r?\n/)
      const sanitizeRow = (row: string) => row.replace(/\\\|/g, '__ESCAPED_PIPE__')
      const headers = sanitizeRow(lines[0])
        .split('|')
        .filter(h => h.trim())
        .map(h => h.replace(/__ESCAPED_PIPE__/g, '|').trim())
      const rows = lines.slice(2).map(row =>
        sanitizeRow(row)
          .split('|')
          .filter(c => c.trim())
          .map(c => c.replace(/__ESCAPED_PIPE__/g, '|').trim())
      )

      let table = '<table class="w-full text-sm my-3"><thead><tr class="border-b border-border">'
      headers.forEach(h => {
        table += `<th class="text-left py-2 px-3 text-foreground font-semibold">${h}</th>`
      })
      table += '</tr></thead><tbody>'
      rows.forEach(row => {
        table += '<tr class="border-b border-border/50">'
        row.forEach(cell => {
          table += `<td class="py-2 px-3 text-muted-foreground">${cell}</td>`
        })
        table += '</tr>'
      })
      table += '</tbody></table>'
      return table
    })

    // Inline formatting (links, inline code, bold)
    html = formatInline(html)

    // Unordered lists
    const listLines = html.split('\n')
    const listOutput: string[] = []
    let inList = false
    listLines.forEach((line) => {
      const match = line.match(/^\s*-\s+(.+)/)
      if (match) {
        if (!inList) {
          listOutput.push('<ul class="list-disc list-inside text-muted-foreground space-y-0 leading-tight m-0">')
          inList = true
        }
        listOutput.push(`<li class="leading-tight m-0">${match[1]}</li>`)
      } else {
        if (inList) {
          listOutput.push('</ul>')
          inList = false
        }
        listOutput.push(line)
      }
    })
    if (inList) {
      listOutput.push('</ul>')
    }
    html = listOutput.join('\n')

    const blankLineToken = '@@BLANKLINE@@'
    const splitWithBlankLines = (source: string) => {
      const lines = source.split('\n')
      const blocks: string[] = []
      let buffer: string[] = []
      let pendingBlank = false

      for (const line of lines) {
        if (!line.trim()) {
          if (buffer.length > 0) {
            blocks.push(buffer.join('\n'))
            buffer = []
          }
          pendingBlank = true
          continue
        }

        if (pendingBlank && blocks.length > 0) {
          blocks.push(blankLineToken)
          pendingBlank = false
        }
        buffer.push(line)
      }

      if (buffer.length > 0) {
        blocks.push(buffer.join('\n'))
      }

      return blocks
    }

    // Split into paragraphs and process
    const parts = splitWithBlankLines(html)
    const processedParts = parts.flatMap(part => {
      part = part.trim()

      if (!part) {
        return []
      }
      if (part === blankLineToken) {
        return ['<div class="h-2"></div>']
      }

      if (part.includes('@@CODEBLOCK:')) {
        const chunks = part.split(/(@@CODEBLOCK:[^@]+@@)/)
        return chunks.map(chunk => {
          const trimmed = chunk.trim()
          if (!trimmed) {
            return ''
          }
          if (trimmed.startsWith('@@CODEBLOCK:')) {
            return trimmed
          }
          if (trimmed.startsWith('<table') || trimmed.startsWith('<code') || trimmed.startsWith('<ul')) {
            return trimmed
          }
          const withBreaks = trimmed.replace(/\n/g, '<br />')
          return withBreaks ? `<p class="text-muted-foreground leading-relaxed m-0">${withBreaks}</p>` : ''
        }).filter(Boolean)
      }

      if (part.startsWith('<table') || part.startsWith('<code') || part.startsWith('<ul')) {
        return [part]
      }

      const withBreaks = part.replace(/\n/g, '<br />')
      return withBreaks ? [`<p class="text-muted-foreground leading-relaxed m-0">${withBreaks}</p>`] : []
    })

    html = processedParts.join('\n')

    // Replace code block placeholders with actual components
    const parts2 = html.split(/(@@CODEBLOCK:[^@]+@@)/)
    
    return {
      content: (
        <div className="space-y-0">
          {parts2.map((part, idx) => {
            if (part.startsWith('@@CODEBLOCK:')) {
              const blockId = part.replace('@@CODEBLOCK:', '').replace(/@@$/, '')
              const block = codeBlocks.find(b => b.id === blockId)
              if (!block) return null

              const language = block.lang?.toLowerCase() || 'text'
              const resolvedLanguage = language === 'shell' ? 'bash' : language
              
              return (
                <div key={idx} className="relative group">
                  <SyntaxHighlighter
                    language={resolvedLanguage}
                    style={syntaxTheme}
                    wrapLongLines={block.wrap}
                    customStyle={{
                      backgroundColor: '#0d1117',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      margin: '0.25rem 0',
                      padding: '0.5rem',
                      overflowX: 'auto'
                    }}
                    codeTagProps={{ className: 'font-mono' }}
                  >
                    {block.code}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => copyCode(block.code, block.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: '#1e1e1e' }}
                    aria-label="Copy code"
                  >
                    {copiedId === block.id ? (
                      <Check className="w-3.5 h-3.5" style={{ color: '#69B131' }} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              )
            }
            
            return <div key={idx} dangerouslySetInnerHTML={{ __html: part }} />
          })}
        </div>
      ),
      footerText
    }
  }

  // Determine if card should span multiple rows
    const spanClass = card.classes?.includes('row-span-2') ? 'md:row-span-2' : ''
    const { content, footerText } = renderContent()

  return (
    <div className={`rounded-lg overflow-hidden flex flex-col h-full purple-border ${spanClass}`} style={{ backgroundColor: '#1e1e1e' }}>
      {/* Card Content */}
      <div className="p-3 flex-1 relative">
        {/* Card Title Badge - Top Left */}
        <div className="absolute top-0 left-0 px-3 py-1 rounded-l-md rounded-br-md text-white text-[14px]  z-10" style={{ background: ' #875ae0 ' }}>
          {card.title}
        </div>
        
        <div className="pt-8">
          {content}
        </div>
      </div>

      {/* Card Footer - only if hasFooter is true */}
      {footerText && (
        <div
          className="px-3 py-2 border-t text-sm text-muted-foreground"
          style={{ backgroundColor: '#252525', borderColor: 'rgba(135, 90, 224, 0.2)' }}
        >
          <div dangerouslySetInnerHTML={{ __html: footerText }} />
        </div>
      )}
    </div>
  )
}
