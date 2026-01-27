import Image from 'next/image'

interface CheatsheetIconProps {
  name: string
  className?: string
}

export function CheatsheetIcon({ name, className = '' }: CheatsheetIconProps) {
  const iconPath = `/assets/icons/${name.toLowerCase()}.svg`
  
  // Try to load the icon, fallback to first letter if not found
  return (
    <div className={`relative ${className}`}>
      <Image
        src={iconPath || "/placeholder.svg"}
        alt={`${name} icon`}
        fill
        className="object-contain p-1"
        onError={(e) => {
          // Fallback to letter if icon doesn't exist
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<span class="text-sm font-semibold">${name.charAt(0).toUpperCase()}</span>`
          }
        }}
      />
    </div>
  )
}
