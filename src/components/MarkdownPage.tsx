import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownPage.css'

type MarkdownPageProps = {
  markdown: string
  loading: boolean
  error: string | null
  pageId?: string
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

function MarkdownPage({ markdown, loading, error, pageId }: MarkdownPageProps) {
  const sections = useMemo(() => splitIntoReadingSections(markdown), [markdown])
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('.qa-card'))
    if (!cards.length) return
    const visibility = new Map<HTMLElement, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target as HTMLElement, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        const visibleCard = cards.reduce<HTMLElement | null>((mostVisible, card) => {
          if (!mostVisible || (visibility.get(card) ?? 0) > (visibility.get(mostVisible) ?? 0)) {
            return card
          }

          return mostVisible
        }, null)

        if (!visibleCard || (visibility.get(visibleCard) ?? 0) === 0) return

        const nextIndex = cards.indexOf(visibleCard)
        if (nextIndex === -1 || nextIndex === activeIndexRef.current) return

        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
      },
      {
        root: viewport,
        rootMargin: '-20% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [markdown])

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

    activeIndexRef.current = nextIndex
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

  const activeSection = sections[activeIndex]
  const dayMatch = activeSection?.label.match(/^day\s+0*(\d+)\b/i)
  const readerPosition = pageId === 'interview-prep'
    ? dayMatch
      ? `Day ${Number(dayMatch[1])}`
      : activeSection?.label ?? 'Interview preparation'
    : sections.length
      ? `Question ${activeIndex + 1} of ${sections.length}`
      : 'No questions'

  if (loading || error) {
    return (
      <div className="content-card">
        {loading && <p className="status">Loading content...</p>}
        {error && <p className="status error">{error}</p>}
      </div>
    )
  }

  return (
    <section className="focus-reader" aria-label="Question and answer reader">
      <div className="reader-toolbar">
        <span className="reader-position" aria-live="polite">
          {readerPosition}
        </span>
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
