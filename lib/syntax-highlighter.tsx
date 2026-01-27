export function highlightCode(code: string, language: string): string {
  // Language-specific patterns for syntax highlighting
  const patterns: Record<string, Array<{ pattern: RegExp; className: string }>> = {
    bash: [
      { pattern: /#.*/g, className: 'comment' },
      { pattern: /\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sudo|chmod|chown|export|source)\b/g, className: 'keyword' },
      { pattern: /"[^"]*"|'[^']*'/g, className: 'string' },
      { pattern: /\$\w+|\$\{[^}]+\}/g, className: 'variable' },
      { pattern: /\b\d+\b/g, className: 'number' },
    ],
    javascript: [
      { pattern: /\/\/.*/g, className: 'comment' },
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment' },
      { pattern: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|from|async|await|try|catch|throw|new)\b/g, className: 'keyword' },
      { pattern: /"[^"]*"|'[^']*'|`[^`]*`/g, className: 'string' },
      { pattern: /\b(true|false|null|undefined)\b/g, className: 'boolean' },
      { pattern: /\b\d+(\.\d+)?\b/g, className: 'number' },
      { pattern: /\b(console|document|window|Array|Object|String|Number|Boolean)\b/g, className: 'builtin' },
    ],
    python: [
      { pattern: /#.*/g, className: 'comment' },
      { pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''/g, className: 'comment' },
      { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|pass|break|continue|and|or|not|in|is)\b/g, className: 'keyword' },
      { pattern: /"[^"]*"|'[^']*'/g, className: 'string' },
      { pattern: /\b(True|False|None)\b/g, className: 'boolean' },
      { pattern: /\b\d+(\.\d+)?\b/g, className: 'number' },
      { pattern: /\b(print|len|range|list|dict|str|int|float)\b/g, className: 'builtin' },
    ],
    css: [
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment' },
      { pattern: /[.#][\w-]+/g, className: 'selector' },
      { pattern: /\b(color|background|border|margin|padding|display|flex|grid|position|width|height|font|text)\b/g, className: 'property' },
      { pattern: /"[^"]*"|'[^']*'/g, className: 'string' },
      { pattern: /#[0-9a-fA-F]{3,6}\b/g, className: 'color' },
      { pattern: /\b\d+(px|em|rem|%|vh|vw)?\b/g, className: 'number' },
    ],
  }

  const languagePatterns = patterns[language] || []
  
  // Escape HTML first
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Track positions to avoid overlapping highlights
  const matches: Array<{ start: number; end: number; replacement: string }> = []

  languagePatterns.forEach(({ pattern, className }) => {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match

    while ((match = regex.exec(highlighted)) !== null) {
      const start = match.index
      const end = start + match[0].length
      
      // Check if this position overlaps with existing matches
      const overlaps = matches.some(m => 
        (start >= m.start && start < m.end) || (end > m.start && end <= m.end)
      )
      
      if (!overlaps) {
        matches.push({
          start,
          end,
          replacement: `<span class="syntax-${className}">${match[0]}</span>`
        })
      }
    }
  })

  // Sort matches by position (reverse order to maintain correct indices)
  matches.sort((a, b) => b.start - a.start)

  // Apply replacements
  matches.forEach(({ start, end, replacement }) => {
    highlighted = highlighted.substring(0, start) + replacement + highlighted.substring(end)
  })

  return highlighted
}
