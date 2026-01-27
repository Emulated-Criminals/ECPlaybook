import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCheatsheetBySlug, getAllCheatsheets } from '@/lib/markdown'
import { parseMarkdownContent } from '@/lib/markdown-parser'
import { CheatsheetCard } from '@/components/cheatsheet-card'
import { SearchTrigger } from '@/components/search/search-trigger'
import { ArrowLeft} from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa'

export async function generateStaticParams() {
  const cheatsheets = getAllCheatsheets()
  return cheatsheets.map(sheet => ({
    slug: sheet.slug,
  }))
}

const Loading = () => null

export default async function CheatsheetPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cheatsheet = getCheatsheetBySlug(slug)

  if (!cheatsheet) {
    notFound()
  }

  const sections = parseMarkdownContent(cheatsheet.content)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 backdrop-blur-sm z-30" style={{ backgroundColor: 'rgba(26, 26, 26, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#875ae0] flex items-center justify-center">
              <Image
                src="/assets/logos/Clyde_logo.png"
                alt="Clyde logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-white">Playbook</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="hidden w-72 md:block">
              <SearchTrigger />
            </div>
            
            <a
              href="https://emulatedcriminals.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90 bg-[#2A2A2A] hover:border-white/20 hover:border-[#875ae0] hover:bg-[#875ae0]"
            >
              EmulatedCriminals
            </a>
            
            <a
              href="https://www.linkedin.com/company/emulated-criminals/"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-9 h-9 border border-white/10 bg-[#2A2A2A] flex items-center justify-center rounded-lg transition-colors hover:border-white/20 hover:border-[#875ae0] hover:bg-[#875ae0]"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-4 h-4 text-gray-400 transition-colors group-hover:text-white" />
            </a>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-4" style={{ backgroundColor: '#1A1A1A' }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all cheatsheets</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative z-20 py-16 text-center gradient-border-bottom" style={{ backgroundColor: '#875ae0' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-3">
            {cheatsheet.metadata.title} cheatsheet
          </h1>
          <p className="text-base text-white/80">
            {cheatsheet.metadata.intro}
          </p>
          
          {/* Tags */}
          {cheatsheet.metadata.tags && cheatsheet.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {cheatsheet.metadata.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 border border-white/20 text-white/90 text-sm rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="min-h-screen py-12 grid-pattern purple-glow relative overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
        <div className="max-w-[1600px] mx-auto px-6 relative z-0">
          {sections.map(section => (
            <div
              key={section.id}
              id={section.id}
              className="mb-16 scroll-mt-24 pb-0"
            >
              <h2 className="heading-gradient-line text-2xl font-semibold text-white mb-6 pb-3 pt-6 flex items-center gap-2">
                <span style={{ color: '#875ae0' }}>#</span>
                {section.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridAutoFlow: 'dense' }}>
                {section.cards.map(card => {
                  const spanMatch = card.classes?.match(/col-span-(\d+)/)
                  const span = spanMatch ? Math.max(1, parseInt(spanMatch[1], 10)) : 1
                  const rowMatch = card.classes?.match(/row-span-(\d+)/)
                  const rowSpan = rowMatch ? Math.max(1, parseInt(rowMatch[1], 10)) : 1
                  return (
                    <div
                      key={card.id}
                      id={`${section.id}-${card.id}`}
                      className="scroll-mt-24"
                      style={{
                        gridColumn: `span ${span} / span ${span}`,
                        gridRow: `span ${rowSpan} / span ${rowSpan}`
                      }}
                    >
                      <CheatsheetCard card={card} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export { Loading }
