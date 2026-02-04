import Link from 'next/link'
import Image from 'next/image'
import { getAllCheatsheets } from '@/lib/markdown'
import { resolveIconPath } from '@/lib/icon-path'

const toolLinks = [
  {
    name: 'The Briefing Room',
    href: 'https://briefingroom.emulatedcriminals.com/',
    description: "Keep up to date on EC"
  },
  {
    name: 'EC Github',
    href: 'https://github.com/orgs/Emulated-Criminals/',
    description: 'Our public repo of research & projects'
  },
  {
    name: 'Playbook Home',
    href: '/',
    description: 'Browse all cheatsheets'
  }
]

export function SiteFooter() {
  const cheatsheets = getAllCheatsheets()
  const formatDate = (value: unknown) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10)
    }
    if (typeof value === 'string') {
      return value
    }
    if (value == null) {
      return ''
    }
    return String(value)
  }
  const featured = [...cheatsheets]
    .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
    .slice(0, 3)
  const recent = [...cheatsheets]
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
    .slice(0, 3)

  return (
    <footer className="border-t border-white/5 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              Featured <span className="text-white/50">&nbsp;Cheatsheets</span>
            </h3>
            <div className="space-y-3">
              {featured.map(sheet => {
                const iconPath = resolveIconPath(sheet.slug, sheet.metadata.icon)
                const iconSize = sheet.metadata.iconSize && sheet.metadata.iconSize > 0
                  ? sheet.metadata.iconSize
                  : 24
                return (
                  <Link
                    key={sheet.slug}
                    href={`/${sheet.slug}`}
                    className="group flex items-center p-3 bg-[#2A2A2A] rounded-lg border border-white/5 hover:border-[#875ae0] transition-all duration-200">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                      <Image
                        src={iconPath || "/placeholder.svg"}
                        alt={`${sheet.metadata.title} icon`}
                        width={iconSize}
                        height={iconSize}
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-white group-hover:text-[#875ae0] truncate">
                        {sheet.metadata.title}
                      </h4>
                      <p className="text-xs text-white/50 truncate">
                        {sheet.metadata.categories?.[0] ?? 'Cheatsheet'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              Recent <span className="text-white/50">&nbsp;Cheatsheets</span>
            </h3>
            <div className="space-y-3">
              {recent.map(sheet => {
                const iconPath = resolveIconPath(sheet.slug, sheet.metadata.icon)
                const iconSize = sheet.metadata.iconSize && sheet.metadata.iconSize > 0
                  ? sheet.metadata.iconSize
                  : 24
                return (
                  <Link
                    key={sheet.slug}
                    href={`/${sheet.slug}`}
                    className="group flex items-center p-3 bg-[#2A2A2A] rounded-lg border border-white/5 hover:border-[#875ae0] transition-all duration-200"
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                      <Image
                        src={iconPath || "/placeholder.svg"}
                        alt={`${sheet.metadata.title} icon`}
                        width={iconSize}
                        height={iconSize}
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-white group-hover:text-[#875ae0] truncate">
                        {sheet.metadata.title}
                      </h4>
                      <p className="text-xs text-white/50 truncate">
                        {formatDate(sheet.metadata.date)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#875ae0] mb-4 flex items-center">
              EC <span className="text-white/50">&nbsp;Links</span>
            </h3>
            <div className="space-y-3">
              {toolLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group flex items-center p-3 bg-[#2A2A2A] rounded-lg border border-white/5 hover:border-[#875ae0] transition-all duration-200"
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold">
                    {link.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-white group-hover:text-[#875ae0]">
                      {link.name}
                    </h4>
                    <p className="text-xs text-white/50 truncate">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="text-left">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#875ae0] flex items-center justify-center">
                <Image
                  src="/assets/logos/Clyde_logo.png"
                  alt="Clyde logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">EC Playbook</div>
                <div className="text-xs text-white/60">Quick Reference Ops</div>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Quick reference cheatsheets for offensive security practitioners. Built by
              Emulated Criminals for field operators and learners.
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/" className="text-white/70 hover:text-[#875ae0]">
                  Home
                </Link>
              </div>
              <div>
                <a
                  href="https://emulatedcriminals.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#875ae0]"
                >
                  EmulatedCriminals
                </a>
              </div>
              <div>
                <a
                  href="https://www.linkedin.com/company/emulated-criminals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#875ae0]"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-white/50">
          © {new Date().getFullYear()} Emulated Criminals. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
