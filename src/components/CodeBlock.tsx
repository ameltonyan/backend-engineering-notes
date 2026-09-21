import { useEffect, useMemo, useRef, useState } from 'react'
import { Highlight, Prism } from 'prism-react-renderer'
import type { Language, PrismTheme } from 'prism-react-renderer'

globalThis.Prism = Prism
await Promise.all([
  import('prismjs/components/prism-java'),
  import('prismjs/components/prism-bash'),
])

type CodeColorScheme = 'dark' | 'light'

type CodeBlockProps = {
  code: string
  tags: string[]
  colorScheme: CodeColorScheme
}

type DetectedLanguage = {
  grammar: Language
  label: string
}

const languageByTag: Record<string, DetectedLanguage> = {
  bash: { grammar: 'bash', label: 'Bash' },
  c: { grammar: 'c', label: 'C' },
  'c++': { grammar: 'cpp', label: 'C++' },
  cpp: { grammar: 'cpp', label: 'C++' },
  css: { grammar: 'css', label: 'CSS' },
  docker: { grammar: 'bash', label: 'Shell' },
  go: { grammar: 'go', label: 'Go' },
  graphql: { grammar: 'graphql', label: 'GraphQL' },
  html: { grammar: 'markup', label: 'HTML' },
  hibernate: { grammar: 'java', label: 'Java' },
  java: { grammar: 'java', label: 'Java' },
  javascript: { grammar: 'javascript', label: 'JavaScript' },
  js: { grammar: 'javascript', label: 'JavaScript' },
  json: { grammar: 'json', label: 'JSON' },
  kotlin: { grammar: 'kotlin', label: 'Kotlin' },
  k8s: { grammar: 'yaml', label: 'YAML' },
  kubernetes: { grammar: 'yaml', label: 'YAML' },
  mysql: { grammar: 'sql', label: 'SQL' },
  node: { grammar: 'javascript', label: 'JavaScript' },
  nodejs: { grammar: 'javascript', label: 'JavaScript' },
  postgresql: { grammar: 'sql', label: 'SQL' },
  python: { grammar: 'python', label: 'Python' },
  rust: { grammar: 'rust', label: 'Rust' },
  sh: { grammar: 'bash', label: 'Shell' },
  shell: { grammar: 'bash', label: 'Shell' },
  spring: { grammar: 'java', label: 'Java' },
  'spring-boot': { grammar: 'java', label: 'Java' },
  sql: { grammar: 'sql', label: 'SQL' },
  ts: { grammar: 'typescript', label: 'TypeScript' },
  typescript: { grammar: 'typescript', label: 'TypeScript' },
  xml: { grammar: 'markup', label: 'XML' },
  yaml: { grammar: 'yaml', label: 'YAML' },
  yml: { grammar: 'yaml', label: 'YAML' },
}

const darkTheme: PrismTheme = {
  plain: { color: '#a9b7c6' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#808080', fontStyle: 'italic' } },
    { types: ['keyword', 'boolean', 'important', 'atrule'], style: { color: '#cc7832' } },
    { types: ['string', 'char', 'attr-value', 'regex'], style: { color: '#6a8759' } },
    { types: ['number'], style: { color: '#6897bb' } },
    { types: ['function', 'class-name'], style: { color: '#ffc66d' } },
    { types: ['property', 'constant', 'symbol', 'annotation', 'builtin'], style: { color: '#9876aa' } },
    { types: ['tag', 'selector', 'attr-name'], style: { color: '#e8bf6a' } },
    { types: ['operator', 'entity', 'url'], style: { color: '#a9b7c6' } },
    { types: ['deleted'], style: { color: '#bc3f3c' } },
    { types: ['inserted'], style: { color: '#6a8759' } },
  ],
}

const lightTheme: PrismTheme = {
  plain: { color: '#2b2b2b' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#808080', fontStyle: 'italic' } },
    { types: ['keyword', 'boolean', 'important', 'atrule'], style: { color: '#000080' } },
    { types: ['string', 'char', 'attr-value', 'regex'], style: { color: '#008000' } },
    { types: ['number'], style: { color: '#0000ff' } },
    { types: ['function'], style: { color: '#795e26' } },
    { types: ['class-name', 'property', 'constant', 'symbol', 'annotation', 'builtin'], style: { color: '#660e7a' } },
    { types: ['tag', 'selector', 'attr-name'], style: { color: '#000080' } },
    { types: ['operator', 'entity', 'url'], style: { color: '#2b2b2b' } },
    { types: ['deleted'], style: { color: '#a31515' } },
    { types: ['inserted'], style: { color: '#008000' } },
  ],
}

function fromTags(tags: string[]) {
  for (const tag of tags) {
    const normalizedTag = tag.trim().toLowerCase()
    const directMatch = languageByTag[normalizedTag]
    if (directMatch) return directMatch

    const wordMatch = normalizedTag.split(/[^a-z0-9+#]+/).find((word) => languageByTag[word])
    if (wordMatch) return languageByTag[wordMatch]
  }
}

function detectLanguage(code: string, tags: string[]): DetectedLanguage {
  const tagLanguage = fromTags(tags)
  if (tagLanguage) return tagLanguage

  const trimmedCode = code.trim()
  if (/^\s*(?:\[|\{)/.test(trimmedCode)) {
    try {
      JSON.parse(trimmedCode)
      return { grammar: 'json', label: 'JSON' }
    } catch {
      // Continue with conservative syntax checks.
    }
  }
  if (/\b(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|JOIN)\b[\s\S]*\b(?:FROM|INTO|TABLE|SET|ON)\b/i.test(code)) return { grammar: 'sql', label: 'SQL' }
  if (/\b(?:public|private|protected)\s+(?:static\s+)?(?:class|interface|record|void)|\bSystem\.out\.|^\s*package\s+[\w.]+;/m.test(code)) return { grammar: 'java', label: 'Java' }
  if (/^\s*(?:apiVersion|kind|metadata):|^\s*[\w.-]+:\s*(?:$|[^:=])/m.test(code)) return { grammar: 'yaml', label: 'YAML' }
  if (/^#!.*\b(?:ba)?sh\b|^\s*(?:sudo|curl|grep|docker|kubectl|npm)\s+/m.test(code)) return { grammar: 'bash', label: 'Shell' }
  if (/\b(?:interface|type)\s+\w+|:\s*(?:string|number|boolean)\b/.test(code)) return { grammar: 'typescript', label: 'TypeScript' }
  if (/\b(?:const|let|function)\s+\w+|=>/.test(code)) return { grammar: 'javascript', label: 'JavaScript' }
  if (/\bdef\s+\w+\s*\(|^\s*(?:from\s+\S+\s+)?import\s+/m.test(code)) return { grammar: 'python', label: 'Python' }

  return { grammar: 'plain', label: 'Plain text' }
}

function cleanCode(code: string) {
  return code.replace(/^\s*\r?\n/, '').replace(/\s+$/, '')
}

function CodeBlock({ code, tags, colorScheme }: CodeBlockProps) {
  const normalizedCode = useMemo(() => cleanCode(code), [code])
  const language = useMemo(() => detectLanguage(normalizedCode, tags), [normalizedCode, tags])
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(normalizedCode)
      setCopied(true)
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-toolbar">
        <span className="code-language">{language.label}</span>
        <button className="code-copy-button" type="button" onClick={() => void copyCode()} aria-label="Copy code example">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight theme={colorScheme === 'dark' ? darkTheme : lightTheme} code={normalizedCode} language={language.grammar}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} code-highlight`} style={{ ...style, background: 'transparent' }} tabIndex={0}>
            <code>
              {tokens.map((line, lineIndex) => (
                <span {...getLineProps({ line })} className="code-line" key={lineIndex}>
                  <span className="code-line-number" aria-hidden="true">{lineIndex + 1}</span>
                  <span className="code-line-content">
                    {line.map((token, tokenIndex) => <span {...getTokenProps({ token })} key={tokenIndex} />)}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export type { CodeColorScheme }
export default CodeBlock
