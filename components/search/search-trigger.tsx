'use client'

import { Search } from 'lucide-react'
import { useSearch } from '@/components/search/search-provider'

interface SearchTriggerProps {
  className?: string
}

export function SearchTrigger({ className = '' }: SearchTriggerProps) {
  const { open } = useSearch()

  return (
    <button
      type="button"
      onClick={() => open()}
      className={`relative flex w-full items-center rounded-lg border border-white/10 bg-[#2A2A2A] px-3 py-2 text-left text-sm text-white transition hover:border-primary/50 hover:bg-[#323232] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label="Open search"
    >
      <Search className="mr-2 h-4 w-4 text-gray-400" />
      <span className="flex-1 truncate text-gray-200">Search for cheatsheet</span>
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <kbd className="rounded border border-white/10 bg-[#1A1A1A] px-2 py-0.5 font-mono text-[11px] text-gray-400">
          Ctrl / Cmd
        </kbd>
        <span>+</span>
        <kbd className="rounded border border-white/10 bg-[#1A1A1A] px-2 py-0.5 font-mono text-[11px] text-gray-400">
          K
        </kbd>
      </span>
    </button>
  )
}
