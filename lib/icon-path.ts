import fs from 'fs'
import path from 'path'

const fallbackIcon = '/assets/icons/file-text.svg'

const resolveIconsDirectory = () => path.join(process.cwd(), 'public', 'assets', 'icons')

export const resolveIconPath = (slug: string, icon?: string) => {
  if (!icon) {
    const slugIconPath = `/assets/icons/${slug}.svg`
    const slugIconFile = path.join(resolveIconsDirectory(), `${slug}.svg`)
    return fs.existsSync(slugIconFile) ? slugIconPath : fallbackIcon
  }
  if (icon.startsWith('/')) return icon
  if (icon.startsWith('http://') || icon.startsWith('https://')) return icon
  if (icon.endsWith('.svg')) return `/assets/icons/${icon}`
  return `/assets/icons/${icon}.svg`
}
