import { refractor } from 'refractor/all'

const nmap = (Prism: typeof refractor) => {
  Prism.languages.nmap = {
    comment: /#.*/,
    command: {
      pattern: /\bnmap\b/,
      alias: 'command'
    },
    option: {
      pattern: /(^|\s)-{1,2}[a-zA-Z0-9][\w-]*/,
      lookbehind: true,
      alias: 'option'
    },
    target: {
      pattern: /\b(?:\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?|\d{1,3}(?:\.\d{1,3}){2}\.\d{1,3}-\d{1,3}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
      alias: 'target'
    }
  }
}

nmap.displayName = 'nmap'
nmap.aliases = []

export const registerNmapLanguage = () => {
  if (refractor.registered('nmap')) {
    return
  }
  refractor.register(nmap)
}
