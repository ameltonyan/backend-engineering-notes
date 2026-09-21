import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ContentPageData, ContentQuestion } from '../content/content-api'
import CodeBlock from './CodeBlock'
import type { CodeColorScheme } from './CodeBlock'
import './QuestionReader.css'

type QuestionReaderProps = {
  page: ContentPageData | null
  loading: boolean
  error: string | null
  pageId?: string
  codeColorScheme: CodeColorScheme
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
          <aside className="question-example">
            <h3>Example</h3>
            <div className="question-example-content">
              {answerParagraphs(question.example).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </aside>
        )}
        {question.codeSnippet && (
          <div className="question-code">
            <h3>Code example</h3>
            <CodeBlock code={question.codeSnippet} tags={question.tags} colorScheme={codeColorScheme} />
          </div>
        )}
      </div>
    </section>
  )
}

function QuestionReader({ page, loading, error, pageId, codeColorScheme }: QuestionReaderProps) {
  const questions = page?.questions ?? emptyQuestions
  const readerQuestions = useMemo(() => buildReadingOrder(questions), [questions])
  const isContentReady = !loading && Boolean(page)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const viewportRef = useRef<HTMLDivElement>(null)

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
        <div className="reader-actions">
          <button type="button" aria-label="Previous question" disabled={activeIndex === 0} onClick={() => goToQuestion(activeIndex - 1)}><span aria-hidden="true">↑</span></button>
          <button type="button" aria-label="Next question" disabled={activeIndex >= readerQuestions.length - 1} onClick={() => goToQuestion(activeIndex + 1)}><span aria-hidden="true">↓</span></button>
        </div>
      </div>
      <div className="reader-frame">
        <div ref={viewportRef} className="reader-viewport" tabIndex={0} onKeyDown={(event) => {
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
