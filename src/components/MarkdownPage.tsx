import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownPage.css'

type MarkdownPageProps = {
  markdown: string
  loading: boolean
  error: string | null
}

type ReadingSection = {
  id: string
  label: string
  markdown: string
}

const supportingHeadings = new Set([
  'question',
  'answer',
  'interview answer',
  'deep dive',
  'internal implementation',
  'follow-up questions',
  'key points',
  'key points to remember',
  'real world usage',
  'common follow-up questions',
])

function plainHeading(value: string) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_[\]]/g, '')
    .trim()
}

function splitIntoReadingSections(markdown: string): ReadingSection[] {
  const lines = markdown.split(/\r?\n/)
  const preamble: string[] = []
  const sections: Array<{ label: string; lines: string[] }> = []
  let current: { label: string; lines: string[] } | null = null
  let fenced = false

  lines.forEach((line) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced

    const heading = !fenced ? line.match(/^##\s+(.+?)\s*#*\s*$/) : null
    const label = heading ? plainHeading(heading[1]) : ''
    const startsSection = Boolean(heading && !supportingHeadings.has(label.toLowerCase()))

    if (startsSection) {
      if (current) sections.push(current)
      current = { label, lines: [line] }
      return
    }

    if (current) current.lines.push(line)
    else preamble.push(line)
  })

  if (current) sections.push(current)

  if (!sections.length) {
    return markdown.trim()
      ? [{ id: 'section-1', label: 'Notes', markdown }]
      : []
  }

  const overview = preamble
    .filter((line) => !/^#\s+/.test(line))
    .join('\n')
    .trim()

  const result = sections.map((section, index) => ({
    id: `section-${index + 1}`,
    label: section.label,
    markdown: section.lines.join('\n').trim(),
  }))

  if (overview) {
    result.unshift({ id: 'overview', label: 'Overview', markdown: overview })
  }

  return result
}

function MarkdownPage({ markdown, loading, error }: MarkdownPageProps) {
  const sections = useMemo(() => splitIntoReadingSections(markdown), [markdown])
  const [activeIndex, setActiveIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    setActiveIndex(0)
    viewportRef.current?.scrollTo({ top: 0 })
  }, [markdown])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const updateActiveSection = () => {
    if (frameRef.current !== null) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const viewport = viewportRef.current
      if (!viewport) return

      const viewportCenter = viewport.getBoundingClientRect().top + viewport.clientHeight / 2
      const cards = Array.from(viewport.querySelectorAll<HTMLElement>('.qa-card'))
      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY

      cards.forEach((card, index) => {
        const bounds = card.getBoundingClientRect()
        const cardCenter = bounds.top + Math.min(bounds.height, viewport.clientHeight) / 2
        const distance = Math.abs(cardCenter - viewportCenter)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      setActiveIndex(nearestIndex)
    })
  }

  const goToSection = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, sections.length - 1))
    const viewport = viewportRef.current
    const card = viewport?.querySelectorAll<HTMLElement>('.qa-card')[nextIndex]

    if (viewport && card) {
      const fitsViewport = card.offsetHeight <= viewport.clientHeight - 32
      const top = fitsViewport
        ? card.offsetTop - (viewport.clientHeight - card.offsetHeight) / 2
        : card.offsetTop - 16

      viewport.scrollTo({ top, behavior: 'smooth' })
    }

    setActiveIndex(nextIndex)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault()
      goToSection(activeIndex + 1)
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault()
      goToSection(activeIndex - 1)
    }
  }

  if (loading || error) {
    return (
      <div className="content-card">
        {loading && <p className="status">Loading content...</p>}
        {error && <p className="status error">{error}</p>}
      </div>
    )
  }

  return (
    <section className="focus-reader" aria-label="Focused reading mode">
      <div className="reader-toolbar">
        <div>
          <span className="reader-eyebrow">Focused reading</span>
          <span className="reader-position" aria-live="polite">
            {sections.length ? `${activeIndex + 1} of ${sections.length}` : 'No sections'}
          </span>
        </div>
        <div className="reader-actions">
          <button
            type="button"
            aria-label="Previous question"
            disabled={activeIndex === 0}
            onClick={() => goToSection(activeIndex - 1)}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            type="button"
            aria-label="Next question"
            disabled={activeIndex >= sections.length - 1}
            onClick={() => goToSection(activeIndex + 1)}
          >
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>

      <div className="reader-frame">
        <div
          ref={viewportRef}
          className="reader-viewport"
          tabIndex={0}
          onScroll={updateActiveSection}
          onKeyDown={handleKeyDown}
          aria-label="Questions and answers. Scroll vertically or use arrow keys to navigate."
        >
          {sections.map((section, index) => (
            <section
              className={index === activeIndex ? 'qa-card active' : 'qa-card'}
              key={section.id}
              aria-label={section.label}
            >
              <article className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
              </article>
            </section>
          ))}
        </div>
      </div>
      <p className="reader-hint">Scroll · swipe · use ↑ ↓</p>
    </section>
  )
}

export default MarkdownPage
