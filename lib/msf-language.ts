import { refractor } from 'refractor/all'

const msf = (Prism: typeof refractor) => {
  Prism.languages.msf = {
    comment: /#.*/,
    command: {
      pattern: /(^|\n)\s*(?:msfconsole|use|setg|unsetg|set|unset|show|search|info|exploit|run|back|exit|help|options|sessions|jobs|route|connect)\b/m,
      lookbehind: true,
      alias: 'command'
    },
    module: {
      pattern: /\b(?:auxiliary|exploit|post|payload|encoder|evasion)\/[a-z0-9_/-]+\b/i,
      alias: 'module'
    },
    option: {
      pattern: /(^|\s)-{1,2}[a-zA-Z][\w-]*/,
      lookbehind: true,
      alias: 'option'
    },
    target: {
      pattern: /\b(?:\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?|\d{1,3}(?:\.\d{1,3}){2}\.\d{1,3}-\d{1,3}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
      alias: 'target'
    }
  }
}

msf.displayName = 'msf'
msf.aliases = ['metasploit']

export const registerMsfLanguage = () => {
  if (refractor.registered('msf')) {
    return
  }
  refractor.register(msf)
}
