import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ContentPageData, ContentQuestion } from '../content/content-api'
import { fontSizeOptions, themeOptions } from '../reading-preferences'
import type { ReaderFontSize, ReadingTheme } from '../reading-preferences'
import CodeBlock from './CodeBlock'
import type { CodeColorScheme } from './CodeBlock'
import './QuestionReader.css'

type QuestionReaderProps = {
  page: ContentPageData | null
  loading: boolean
  error: string | null
  pageId?: string
  codeColorScheme: CodeColorScheme
  isFocusMode: boolean
  onFocusModeChange: (enabled: boolean) => void
  theme: ReadingTheme
  onThemeChange: (theme: ReadingTheme) => void
  readerFontSize: ReaderFontSize
  onReaderFontSizeChange: (size: ReaderFontSize) => void
}

const readingPositionStorageKey = 'backend-engineering-notes:reading-positions'
const emptyQuestions: ContentQuestion[] = []

type ReaderQuestion = {
  question: ContentQuestion
  depth: number
}

function compareQuestions(left: ContentQuestion, right: ContentQuestion) {
  return left.displayOrder - right.displayOrder || left.id - right.id
}

function buildReadingOrder(questions: ContentQuestion[]): ReaderQuestion[] {
  const questionsById = new Map(questions.map((question) => [question.id, question]))
  const childrenByParentId = new Map<number, ContentQuestion[]>()
  const roots: ContentQuestion[] = []

  questions.forEach((question) => {
    if (question.parentQuestionId === null || !questionsById.has(question.parentQuestionId)) {
      roots.push(question)
      return
    }

    const children = childrenByParentId.get(question.parentQuestionId) ?? []
    children.push(question)
    childrenByParentId.set(question.parentQuestionId, children)
  })

  roots.sort(compareQuestions)
  childrenByParentId.forEach((children) => children.sort(compareQuestions))

  const ordered: ReaderQuestion[] = []
  const visited = new Set<number>()
  const addBranch = (question: ContentQuestion, depth: number) => {
    if (visited.has(question.id)) return

    visited.add(question.id)
    ordered.push({ question, depth })
    childrenByParentId.get(question.id)?.forEach((child) => addBranch(child, depth + 1))
  }

  roots.forEach((question) => addBranch(question, 0))
  questions.slice().sort(compareQuestions).forEach((question) => addBranch(question, 0))

  return ordered
}

function getSavedReadingPosition(pageId: string) {
  try {
    const savedPositions = JSON.parse(window.localStorage.getItem(readingPositionStorageKey) ?? '{}') as Record<string, unknown>
    const position = savedPositions[pageId]
    return typeof position === 'number' && Number.isFinite(position) ? position : 0
  } catch {
    return 0
  }
}

function saveReadingPosition(pageId: string, position: number) {
  try {
    const savedPositions = JSON.parse(window.localStorage.getItem(readingPositionStorageKey) ?? '{}') as Record<string, unknown>
    savedPositions[pageId] = position
    window.localStorage.setItem(readingPositionStorageKey, JSON.stringify(savedPositions))
  } catch {
    // Reading-position persistence is optional when storage is unavailable.
  }
}

function answerParagraphs(answer: string) {
  return answer
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter(Boolean)
}

function FocusModeIcon({ active }: { active: boolean }) {
  return (
    <svg className="focus-mode-icon" viewBox="0 0 24 24" aria-hidden="true">
      {active ? (
        <path d="M9 3v6H3M15 3v6h6M21 15h-6v6M3 15h6v6" />
      ) : (
        <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
      )}
    </svg>
  )
}

function QuestionCard({ item, isActive, codeColorScheme }: { item: ReaderQuestion; isActive: boolean; codeColorScheme: CodeColorScheme }) {
  const { question, depth } = item
  return (
    <section
      className={`qa-card${isActive ? ' active' : ''}${depth > 0 ? ' follow-up' : ''}`}
      aria-label={depth > 0 ? `Follow-up: ${question.question}` : question.question}
    >
      <span className="qa-card-surface" aria-hidden="true" />
      <div className="qa-card-content">
        <h2>{question.question}</h2>
        <div className="question-answer">
          {answerParagraphs(question.answer).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        {question.example && (
          <details className="question-detail question-example">
            <summary>
              <span>Example</span>
              <span className="detail-action" aria-hidden="true"><span className="detail-show">Show</span><span className="detail-hide">Hide</span></span>
            </summary>
            <div className="question-example-content">
              {answerParagraphs(question.example).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </details>
        )}
        {question.codeSnippet && (
          <details className="question-detail question-code">
            <summary>
              <span>Code example</span>
              <span className="detail-action" aria-hidden="true"><span className="detail-show">Show</span><span className="detail-hide">Hide</span></span>
            </summary>
            <div className="question-code-content">
              <CodeBlock code={question.codeSnippet} tags={question.tags} colorScheme={codeColorScheme} />
            </div>
          </details>
        )}
      </div>
    </section>
  )
}

function QuestionReader({
  page,
  loading,
  error,
  pageId,
  codeColorScheme,
  isFocusMode,
  onFocusModeChange,
  theme,
  onThemeChange,
  readerFontSize,
  onReaderFontSizeChange,
}: QuestionReaderProps) {
  const questions = page?.questions ?? emptyQuestions
  const readerQuestions = useMemo(() => buildReadingOrder(questions), [questions])
  const isContentReady = !loading && Boolean(page)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const hasRenderedFocusMode = useRef(false)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !pageId || !isContentReady) return

    const savedPosition = getSavedReadingPosition(pageId)
    viewport.scrollTop = Math.min(savedPosition, Math.max(0, viewport.scrollHeight - viewport.clientHeight))

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('.qa-card'))
    const nextIndex = cards.findIndex((card) => card.offsetTop + card.offsetHeight > viewport.scrollTop)
    activeIndexRef.current = nextIndex === -1 ? 0 : nextIndex
    setActiveIndex(activeIndexRef.current)
  }, [isContentReady, pageId, readerQuestions.length])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !pageId || !isContentReady) return

    const savePosition = () => saveReadingPosition(pageId, viewport.scrollTop)
    viewport.addEventListener('scroll', savePosition, { passive: true })
    return () => {
      savePosition()
      viewport.removeEventListener('scroll', savePosition)
    }
  }, [isContentReady, pageId])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !readerQuestions.length) return

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('.qa-card'))
    const visibility = new Map<HTMLElement, number>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target as HTMLElement, entry.isIntersecting ? entry.intersectionRatio : 0))
      const visibleCard = cards.reduce<HTMLElement | null>((mostVisible, card) =>
        !mostVisible || (visibility.get(card) ?? 0) > (visibility.get(mostVisible) ?? 0) ? card : mostVisible,
        null)
      if (!visibleCard || (visibility.get(visibleCard) ?? 0) === 0) return

      const nextIndex = cards.indexOf(visibleCard)
      if (nextIndex !== -1 && nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
      }
    }, { root: viewport, rootMargin: '-20% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] })

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [readerQuestions])

  useLayoutEffect(() => {
    if (!hasRenderedFocusMode.current) {
      hasRenderedFocusMode.current = true
      return
    }

    const viewport = viewportRef.current
    const card = viewport?.querySelectorAll<HTMLElement>('.qa-card')[activeIndexRef.current]
    if (!viewport || !card) return

    const animationFrame = window.requestAnimationFrame(() => {
      const top = card.offsetHeight <= viewport.clientHeight - 32
        ? card.offsetTop - (viewport.clientHeight - card.offsetHeight) / 2
        : card.offsetTop - 16
      viewport.scrollTop = Math.max(0, top)
    })
    return () => window.cancelAnimationFrame(animationFrame)
  }, [isFocusMode])

  const goToQuestion = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, readerQuestions.length - 1))
    const viewport = viewportRef.current
    const card = viewport?.querySelectorAll<HTMLElement>('.qa-card')[nextIndex]
    if (viewport && card) {
      const top = card.offsetHeight <= viewport.clientHeight - 32
        ? card.offsetTop - (viewport.clientHeight - card.offsetHeight) / 2
        : card.offsetTop - 16
      viewport.scrollTo({ top, behavior: 'smooth' })
    }
    activeIndexRef.current = nextIndex
    setActiveIndex(nextIndex)
  }

  if (error && !page) return <div className="content-card"><p className="status error">{error}</p></div>
  if (!page) return <div className="content-card"><p className="status">{loading ? 'Loading questions...' : 'No page available.'}</p></div>
  if (!readerQuestions.length) return <div className="content-card"><p className="status">No published questions are available for this topic yet.</p></div>

  return (
    <section className="focus-reader" aria-label="Question and answer reader">
      {loading && <p className="status loading-status" aria-live="polite">Loading questions...</p>}
      {error && <p className="status error" role="alert">{error}</p>}
      <div className="reader-toolbar">
        <span className="reader-position" aria-live="polite">Question {activeIndex + 1} of {readerQuestions.length}</span>
        {isFocusMode && (
          <div className="focus-reading-preferences" aria-label="Focus mode reading preferences">
            <div className="focus-preference-group" role="group" aria-label="Color theme">
              {themeOptions.map((option) => (
                <button
                  className={theme === option.value ? 'reader-preference-button selected' : 'reader-preference-button'}
                  type="button"
                  aria-pressed={theme === option.value}
                  aria-label={`${option.label} theme`}
                  title={option.label}
                  key={option.value}
                  onClick={() => onThemeChange(option.value)}
                >
                  <span aria-hidden="true">{option.icon}</span>
                </button>
              ))}
            </div>
            <div className="focus-preference-group" role="group" aria-label="Reading text size">
              {fontSizeOptions.map((option) => (
                <button
                  className={readerFontSize === option.value ? 'reader-preference-button selected reader-font-button' : 'reader-preference-button reader-font-button'}
                  type="button"
                  aria-pressed={readerFontSize === option.value}
                  aria-label={option.label}
                  title={option.label}
                  key={option.value}
                  onClick={() => onReaderFontSizeChange(option.value)}
                >
                  <span aria-hidden="true">{option.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="reader-actions">
          <button type="button" aria-label="Previous question" disabled={activeIndex === 0} onClick={() => goToQuestion(activeIndex - 1)}><span aria-hidden="true">↑</span></button>
          <button type="button" aria-label="Next question" disabled={activeIndex >= readerQuestions.length - 1} onClick={() => goToQuestion(activeIndex + 1)}><span aria-hidden="true">↓</span></button>
          <button
            className={isFocusMode ? 'focus-mode-button active' : 'focus-mode-button'}
            type="button"
            aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            aria-pressed={isFocusMode}
            title={isFocusMode ? 'Exit focus mode (Escape)' : 'Enter focus mode'}
            onClick={() => onFocusModeChange(!isFocusMode)}
          >
            <FocusModeIcon active={isFocusMode} />
          </button>
        </div>
      </div>
      <div className="reader-frame">
        <div ref={viewportRef} className="reader-viewport" tabIndex={0} onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); goToQuestion(activeIndex + 1) }
          if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goToQuestion(activeIndex - 1) }
        }} aria-label="Questions and answers. Scroll vertically or use arrow keys to navigate.">
          {page.description && <p className="page-description">{page.description}</p>}
          {readerQuestions.map((item, index) => <QuestionCard key={item.question.id} item={item} isActive={index === activeIndex} codeColorScheme={codeColorScheme} />)}
        </div>
      </div>
      <p className="reader-hint">Scroll · swipe · use ↑ ↓</p>
    </section>
  )
}

export default QuestionReader
