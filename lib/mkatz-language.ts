import { refractor } from 'refractor/all'

const mkatz = (Prism: typeof refractor) => {
  Prism.languages.mkatz = {
    comment: /#.*/,
    prompt: {
      pattern: /(^|\n)\s*mimikatz\s*#\s*/m,
      alias: 'command'
    },
    module: {
      pattern: /\b(?:sekurlsa|lsadump|crypto|kerberos|privilege|token|vault|misc|process|service|dpapi|sysenv|event|net|rpc|sid|standard)\b/i,
      alias: 'builtin'
    },
    command: {
      pattern: /\b(?:log|exit|version|help|privilege::debug|token::whoami|sekurlsa::logonpasswords|sekurlsa::tickets|sekurlsa::ekeys|lsadump::sam|lsadump::secrets|lsadump::lsa|lsadump::dcsync|kerberos::list|kerberos::ptt|misc::cmd|process::list|process::run|privilege::tcb|privilege::backup|privilege::restore|token::elevate|token::revert|vault::cred|dpapi::masterkey|dpapi::cache)\b/i,
      alias: 'command'
    },
    option: {
      pattern: /(^|\s)\/[a-zA-Z][\w:-]*/,
      lookbehind: true,
      alias: 'option'
    },
    target: {
      pattern: /\b(?:[A-Z0-9._-]+\\[A-Z0-9._-]+|[A-Z0-9._-]+@[A-Z0-9._-]+|\d{1,3}(?:\.\d{1,3}){3})\b/i,
      alias: 'target'
    }
  }
}

mkatz.displayName = 'mkatz'
mkatz.aliases = ['mimikatz']

export const registerMkatzLanguage = () => {
  if (refractor.registered('mkatz')) {
    return
  }
  refractor.register(mkatz)
}
