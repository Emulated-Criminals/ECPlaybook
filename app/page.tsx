import Link from 'next/link'
import Image from 'next/image'
import { getAllCheatsheets, getAllCategories } from '@/lib/markdown'
import { resolveIconPath } from '@/lib/icon-path'
import { SearchTrigger } from '@/components/search/search-trigger'
import { FaLinkedin } from 'react-icons/fa'

export default function HomePage() {
  const cheatsheets = getAllCheatsheets()
  const categories = getAllCategories()

  // Group cheatsheets by category
  const cheatsheetsByCategory = categories.map(category => ({
    category,
    sheets: cheatsheets.filter(sheet =>
      sheet.metadata.categories.includes(category)
    ),
  }))

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

      {/* Hero Section */}
      <section className="relative z-20 py-20 text-center gradient-border-bottom" style={{ backgroundColor: '#875ae0' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-3">
            EC Playbook
          </h1>
          <p className="text-base text-white/80">
            Quick reference cheatsheets for Offensive Security Practionaries. Contributed to by lessons learned and open source intelligence. 
          </p>
        </div>
      </section>

      {/* Cheatsheet Grid */}
      <section className="min-h-screen py-12 grid-pattern purple-glow relative overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-0">
          {cheatsheets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No cheatsheets found. Add markdown files to the /content folder.</p>
            </div>
          ) : (
            <>
              {/* Category Sections */}
              {cheatsheetsByCategory.map(({ category, sheets }) =>
                sheets.length > 0 ? (
                  <div key={category} className="mb-16 pb-8">
                    <h2 className="heading-gradient-line text-xl font-semibold text-white mb-6 pb-3 pt-6">
                      {category}
                    </h2>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch"
                      style={{ gridAutoRows: '1fr' }}
                    >
                      {sheets.map(sheet => {
                        const iconPath = resolveIconPath(sheet.slug, sheet.metadata.icon)
                        const iconSize = sheet.metadata.iconSize && sheet.metadata.iconSize > 0
                          ? sheet.metadata.iconSize
                          : 24
                        return (
                          <Link
                            key={sheet.slug}
                            href={`/${sheet.slug}`}
                            className={`${sheet.metadata.background} rounded-lg p-3 opacity-70 hover:opacity-100 transition-all flex items-center gap-3 group purple-border hover:border-primary/50 h-full`}
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Image
                                src={iconPath || "/placeholder.svg"}
                                alt={`${sheet.metadata.title} icon`}
                                width={iconSize}
                                height={iconSize}
                                className="object-contain"
                              />
                            </div>
                            <span className="text-white font-medium text-base">
                              {sheet.metadata.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : null
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
