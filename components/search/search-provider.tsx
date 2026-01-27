'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import type { SearchDocument } from '@/lib/search-index'

type SearchResult = Fuse.FuseResult<SearchDocument>

interface DecoratedResult {
  result: SearchResult
  display: SearchDocument
  anchor: string
}

interface SearchContextValue {
  open: (prefill?: string) => void
  close: () => void
  toggle: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

const fuseOptions: Fuse.IFuseOptions<SearchDocument> = {
  includeMatches: true,
  includeScore: false,
  shouldSort: true,
  matchEmptyQuery: true,
  threshold: 0.1,
  keys: [
    { name: 'title', weight: 12 },
    { name: 'tags', weight: 6 },
    { name: 'categories', weight: 6 },
    { name: 'sections.h3.title', weight: 5 },
    { name: 'sections.h2.title', weight: 1 },
    { name: 'intro', weight: 1 }
  ]
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchData, setSearchData] = useState<SearchDocument[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [fuse, setFuse] = useState<Fuse<SearchDocument> | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const baseResults = useMemo<SearchResult[]>(
    () => searchData.map((item, idx) => ({ item, refIndex: idx })),
    [searchData]
  )

  const openSearch = useCallback((prefill = '') => {
    setIsOpen(true)
    setQuery(prefill)
    // Focus after the modal is visible
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }, [])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Load search data from the API once
  useEffect(() => {
    let isMounted = true
    if (searchData.length > 0) return

    setLoading(true)
    fetch('/api/search')
      .then((resp) => resp.json())
      .then((data: SearchDocument[]) => {
        if (!isMounted) return
        setSearchData(data)
      })
      .catch(() => {
        // Silently fail; UI will show empty state
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [searchData.length])

  // Build Fuse index whenever the data changes
  useEffect(() => {
    if (searchData.length === 0) return
    const index = new Fuse(searchData, fuseOptions)
    setFuse(index)
  }, [searchData])

  // Reset active item when results change
  useEffect(() => {
    setResults(baseResults)
    setActiveIndex(0)
  }, [baseResults])

  // Keep body from scrolling while the search is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  // Global hotkeys
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isCmdK) {
        event.preventDefault()
        openSearch()
      } else if (isOpen && event.key === 'Escape') {
        event.preventDefault()
        closeSearch()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeSearch, isOpen, openSearch])

  const handleSearch = useCallback(
    (value: string) => {
      if (!fuse) return
      const trimmed = value.trim()
      if (trimmed === '') {
        setResults(baseResults)
        setActiveIndex(0)
        return
      }
      const resp = fuse.search(trimmed)
      setResults(resp)
      setActiveIndex(0)
    },
    [baseResults, fuse]
  )

  useEffect(() => {
    handleSearch(query)
  }, [handleSearch, query])

  const handleKeyNavigation = useCallback(
    (direction: 'up' | 'down') => {
      if (results.length === 0) return
      setActiveIndex((prev) => {
        if (direction === 'down') {
          return prev + 1 >= results.length ? prev : prev + 1
        }
        return prev - 1 < 0 ? 0 : prev - 1
      })
    },
    [results.length]
  )

  const highlightText = useCallback((text: string, indices: readonly [number, number][]) => {
    if (!indices || indices.length === 0) return escapeHtml(text)
    let result = ''
    let lastIndex = 0
    const ordered = [...indices].sort((a, b) => a[0] - b[0])

    ordered.forEach(([start, end]) => {
      result += escapeHtml(text.slice(lastIndex, start))
      result += `<mark class="search-highlight">${escapeHtml(text.slice(start, end + 1))}</mark>`
      lastIndex = end + 1
    })

    result += escapeHtml(text.slice(lastIndex))
    return result
  }, [])

  const applyHighlights = useCallback(
    (doc: SearchDocument, matches?: Fuse.FuseResultMatch[]) => {
      if (!matches || matches.length === 0) return doc
      const clone: SearchDocument = JSON.parse(JSON.stringify(doc))

      matches.forEach((match) => {
        if (!match.value || !match.indices || match.indices.length === 0) return
        const marked = highlightText(String(match.value), match.indices as [number, number][])
        switch (match.key) {
          case 'tags':
          case 'categories':
            if (Array.isArray((clone as any)[match.key]) && match.refIndex !== undefined) {
              ;(clone as any)[match.key][match.refIndex] = marked
            }
            break
          case 'sections.h2.title':
            if (match.refIndex !== undefined && clone.sections[match.refIndex]) {
              clone.sections[match.refIndex].h2.title = marked
            }
            break
          case 'sections.h3.title': {
            let runningIndex = match.refIndex ?? 0
            for (const section of clone.sections) {
              if (runningIndex < section.h3.length) {
                section.h3[runningIndex].title = marked
                break
              }
              runningIndex -= section.h3.length
            }
            break
          }
          default:
            if ((clone as any)[match.key] !== undefined) {
              ;(clone as any)[match.key] = marked
            }
            break
        }
      })

      return clone
    },
    [highlightText]
  )

  const pickAnchor = useCallback((doc: SearchDocument, matches?: Fuse.FuseResultMatch[]) => {
    if (!matches || matches.length === 0) return ''

    const h3Match = matches.find((m) => m.key === 'sections.h3.title')
    if (h3Match && h3Match.refIndex !== undefined) {
      let runningIndex = h3Match.refIndex
      for (const section of doc.sections) {
        if (runningIndex < section.h3.length) {
          return section.h3[runningIndex].anchor
        }
        runningIndex -= section.h3.length
      }
    }

    const h2Match = matches.find((m) => m.key === 'sections.h2.title')
    if (h2Match && h2Match.refIndex !== undefined) {
      const section = doc.sections[h2Match.refIndex]
      if (section) {
        return section.h2.anchor
      }
    }

    return ''
  }, [])

  const decoratedResults: DecoratedResult[] = useMemo(
    () =>
      results.map((result) => ({
        result,
        display: applyHighlights(result.item, result.matches),
        anchor: pickAnchor(result.item, result.matches)
      })),
    [applyHighlights, pickAnchor, results]
  )

  const openActiveResult = useCallback(() => {
    const active = decoratedResults[activeIndex]
    if (!active) return
    const targetHref = `${active.result.item.path}${active.anchor || ''}`
    router.push(targetHref)
    closeSearch()
  }, [activeIndex, closeSearch, decoratedResults, router])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      handleKeyNavigation('down')
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      handleKeyNavigation('up')
    } else if (event.key === 'Enter') {
      event.preventDefault()
      openActiveResult()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeSearch()
    }
  }

  return (
    <SearchContext.Provider value={{ open: openSearch, close: closeSearch, toggle: toggleSearch }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 py-10">
          <div className="absolute inset-0" onClick={closeSearch} />
          <div className="relative w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#1d1b24] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/5 bg-[#14121a] px-4 py-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-[#1f1c27] px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for cheatsheets, tags, or sections"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
                <span className="rounded-md border border-white/10 bg-[#0f0d13] px-2 py-1 font-mono">Ctrl/Cmd + K</span>
                <span>to open</span>
              </div>
              <button
                onClick={closeSearch}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#251f30] px-3 py-2 text-sm text-white/80 transition hover:bg-[#2f2940]"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>

            <div className="flex h-[70vh] flex-col lg:flex-row">
              <div className="flex-1 overflow-y-auto bg-[#16141d] p-3">
                {loading ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building search index...
                  </div>
                ) : decoratedResults.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No results. Try another keyword.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {decoratedResults.map(({ result, display, anchor }, idx) => {
                      const isActive = idx === activeIndex
                      return (
                        <li key={`${result.item.slug}-${idx}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIndex(idx)
                              const targetHref = `${result.item.path}${anchor || ''}`
                              router.push(targetHref)
                              closeSearch()
                            }}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                              isActive
                                ? 'border-primary/60 bg-primary/20 text-white'
                                : 'border-white/5 bg-[#1d1b24] text-slate-200 hover:border-primary/30 hover:bg-[#231f2d]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={clsx(
                                  'flex h-10 w-10 items-center justify-center rounded-lg',
                                  result.item.background || 'bg-white/5'
                                )}
                              >
                                <img
                                  src={result.item.icon}
                                  alt={`${result.item.title} icon`}
                                  className="h-6 w-6 object-contain"
                                />
                              </div>
                              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                                <div
                                  className="text-sm font-semibold leading-snug"
                                  dangerouslySetInnerHTML={{ __html: display.title }}
                                />
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  {display.categories.slice(0, 1).map((cat, catIdx) => (
                                    <span
                                      key={`${result.item.slug}-cat-${catIdx}`}
                                      dangerouslySetInnerHTML={{ __html: cat }}
                                    />
                                  ))}
                                  {display.tags.slice(0, 3).map((tag, tagIdx) => (
                                    <span
                                      key={`${result.item.slug}-tag-${tagIdx}`}
                                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
                                      dangerouslySetInnerHTML={{ __html: tag }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="hidden w-full flex-none overflow-y-auto border-t border-white/5 bg-[#111019] p-4 lg:block lg:w-1/2 lg:border-l lg:border-t-0">
                {decoratedResults[activeIndex] ? (
                  <PreviewPanel doc={decoratedResults[activeIndex]} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Start typing to see details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SearchContext.Provider>
  )
}

function escapeHtml(text: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function PreviewPanel({ doc }: { doc: DecoratedResult }) {
  const { result, display, anchor } = doc
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-white/5 bg-[#17131f] p-4 shadow-inner">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            result.item.background || 'bg-white/5'
          )}
        >
          <img src={result.item.icon} alt="" className="h-6 w-6 object-contain" />
        </div>
        <div>
          <div
            className="text-base font-semibold text-white"
            dangerouslySetInnerHTML={{ __html: display.title }}
          />
          <div className="text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: display.intro }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        {display.categories.map((category, idx) => (
          <span
            key={`preview-cat-${idx}`}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
            dangerouslySetInnerHTML={{ __html: category }}
          />
        ))}
        {display.tags.map((tag, idx) => (
          <span
            key={`preview-tag-${idx}`}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
            dangerouslySetInnerHTML={{ __html: tag }}
          />
        ))}
      </div>

      <div className="overflow-y-auto rounded-md border border-white/5 bg-[#110f18] p-3 text-sm text-slate-200">
        <ol className="space-y-3 list-decimal list-inside">
          {display.sections.map((section, idx) => (
            <li key={`sec-${idx}`} className="space-y-2">
              <a
                href={`${result.item.path}${section.h2.anchor}`}
                className="font-semibold text-primary transition hover:text-white"
                dangerouslySetInnerHTML={{ __html: section.h2.title }}
              />
              {section.h3.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {section.h3.map((item, h3Idx) => (
                    <a
                      key={`h3-${idx}-${h3Idx}`}
                      href={`${result.item.path}${item.anchor}`}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 transition hover:border-primary/40 hover:bg-primary/20 hover:text-white"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      {anchor && (
        <div className="text-xs text-slate-400">
          Press <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">Enter</span> to jump to the
          matched section.
        </div>
      )}
    </div>
  )
}
