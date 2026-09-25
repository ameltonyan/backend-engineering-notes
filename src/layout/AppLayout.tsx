import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import QuestionReader from '../components/QuestionReader'
import { contentProvider } from '../services/content/provider'
import type { ContentTopicData, ContentTopicMeta, Difficulty } from '../content/content-api'
import type { ReaderFontSize, ReadingTheme } from '../reading-preferences'
import './AppLayout.css'

const lastActiveTopicStorageKey = 'backend-engineering-notes:last-active-topic'
const sidebarCollapsedStorageKey = 'backend-engineering-notes:sidebar-collapsed'
const readerFontSizeStorageKey = 'backend-engineering-notes:reader-font-size'
const difficultyStorageKey = 'backend-engineering-notes:difficulty'

function savedDifficulty(): Difficulty {
  const value = window.localStorage.getItem(difficultyStorageKey)
  return value === 'BEGINNER' || value === 'INTERMEDIATE' || value === 'EXPERT' ? value : 'ADVANCED'
}

function savedTheme(): ReadingTheme {
  const value = window.localStorage.getItem('theme')
  return value === 'light' || value === 'paper' || value === 'sepia' ? value : 'dark'
}

function savedReaderFontSize(): ReaderFontSize {
  const value = window.localStorage.getItem(readerFontSizeStorageKey)
  return value === 'small' || value === 'large' ? value : 'standard'
}

function AppLayout() {
  const [topics, setTopics] = useState<ContentTopicMeta[]>([])
  const [topicListDifficulty, setTopicListDifficulty] = useState<Difficulty | null>(null)
  const [activeTopicId, setActiveTopicId] = useState<string>('')
  const [topicData, setTopicData] = useState<ContentTopicData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    window.localStorage.getItem(sidebarCollapsedStorageKey) === 'true',
  )
  const [theme, setTheme] = useState<ReadingTheme>(savedTheme)
  const [readerFontSize, setReaderFontSize] = useState<ReaderFontSize>(savedReaderFontSize)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>(savedDifficulty)

  const activeTopic = useMemo(
    () => topics.find((topic) => topic.id === activeTopicId) ?? topics[0],
    [activeTopicId, topics],
  )
  const activeTopicIndex = topics.findIndex((topic) => topic.id === activeTopic?.id)
  const previousTopic = activeTopicIndex > 0 ? topics[activeTopicIndex - 1] : undefined
  const nextTopic = activeTopicIndex >= 0 ? topics[activeTopicIndex + 1] : undefined

  const selectTopic = (topicId: string) => {
    if (topicId === activeTopicId) return

    setTopicData(null)
    setActiveTopicId(topicId)
  }

  const toggleCategory = (category: string) => {
    setCollapsedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }))
  }

  const openActiveCategory = () => {
    const category = activeTopic?.category || 'Other'
    setCollapsedCategories((current) => ({ ...current, [category]: false }))
    setIsSidebarCollapsed(false)
    setIsSidebarOpen(true)
  }

  useEffect(() => {
    let cancelled = false
    const loadTopicList = async () => {
      setTopicListDifficulty(null)
      setLoading(true)
      setError(null)
      setTopicData(null)
      try {
        const list = await contentProvider.getTopicList(difficulty)
        if (cancelled) return
        setTopics(list)
        setActiveTopicId((currentTopicId) => {
          if (list.some((topic) => topic.id === currentTopicId)) return currentTopicId

          const savedTopicId = window.localStorage.getItem(`${lastActiveTopicStorageKey}:${difficulty}`)
          return list.some((topic) => topic.id === savedTopicId)
            ? savedTopicId!
            : list[0]?.id || ''
        })
        setTopicListDifficulty(difficulty)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load topic list')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadTopicList()
    return () => { cancelled = true }
  }, [difficulty])

  useEffect(() => {
    if (
      !activeTopicId
      || topicListDifficulty !== difficulty
      || !topics.some((topic) => topic.id === activeTopicId)
    ) {
      return
    }

    let cancelled = false

    const loadTopic = async () => {
      setLoading(true)
      setError(null)

      try {
        const topic = await contentProvider.getTopicData(activeTopicId, difficulty)
        if (!cancelled) {
          setTopicData(topic)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load content')
          setTopicData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadTopic()
    return () => {
      cancelled = true
    }
  }, [activeTopicId, difficulty, topicListDifficulty, topics])

  useEffect(() => {
    if (activeTopicId) {
      window.localStorage.setItem(`${lastActiveTopicStorageKey}:${difficulty}`, activeTopicId)
    }
  }, [activeTopicId, difficulty])

  useEffect(() => {
    window.localStorage.setItem(difficultyStorageKey, difficulty)
  }, [difficulty])

  useEffect(() => {
    if (!isSidebarOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isSidebarOpen])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.readingSize = readerFontSize
    window.localStorage.setItem(readerFontSizeStorageKey, readerFontSize)
  }, [readerFontSize])

  useEffect(() => {
    window.localStorage.setItem(sidebarCollapsedStorageKey, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const syncFocusModeWithFullscreen = () => {
      if (!document.fullscreenElement) setIsFocusMode(false)
    }

    document.addEventListener('fullscreenchange', syncFocusModeWithFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFocusModeWithFullscreen)
  }, [])

  useEffect(() => {
    if (!isFocusMode) return

    const exitFocusMode = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFocusMode(false)
    }
    document.addEventListener('keydown', exitFocusMode)
    return () => document.removeEventListener('keydown', exitFocusMode)
  }, [isFocusMode])

  const changeFocusMode = (enabled: boolean) => {
    setIsFocusMode(enabled)

    if (enabled) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
          // Keep the distraction-free layout when browser fullscreen is unavailable.
        })
      }
      return
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {
        // The browser may already be leaving fullscreen (for example via Escape).
      })
    }
  }

  const shellClassName = [
    'app-shell',
    isSidebarCollapsed && 'sidebar-collapsed',
    isFocusMode && 'focus-mode',
  ].filter(Boolean).join(' ')

  return (
    <div className={shellClassName}>
      <Sidebar
        topics={topics}
        activeTopicId={activeTopicId}
        onSelectTopic={selectTopic}
        collapsedCategories={collapsedCategories}
        onToggleCategory={toggleCategory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        readerFontSize={readerFontSize}
        onReaderFontSizeChange={setReaderFontSize}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
      <button
        className="sidebar-edge-toggle"
        type="button"
        aria-label={isSidebarCollapsed ? 'Show navigation' : 'Hide navigation'}
        aria-controls="site-navigation"
        aria-expanded={!isSidebarCollapsed}
        title={isSidebarCollapsed ? 'Show navigation' : 'Hide navigation'}
        onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
      >
        <span aria-hidden="true">{isSidebarCollapsed ? '›' : '‹'}</span>
      </button>
      {isSidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <main className="content">
        <AppHeader
          title={activeTopic?.title ?? 'Loading topic'}
          category={activeTopic?.category ?? 'Loading'}
          onMenuClick={() => setIsSidebarOpen(true)}
          onOpenActiveCategory={openActiveCategory}
          onPreviousTopic={() => previousTopic && selectTopic(previousTopic.id)}
          onNextTopic={() => nextTopic && selectTopic(nextTopic.id)}
          previousTopicTitle={previousTopic?.title}
          nextTopicTitle={nextTopic?.title}
        />
        <QuestionReader
          key={`${difficulty}:${activeTopicId}`}
          topic={topicData}
          loading={loading}
          error={error}
          topicId={activeTopic?.id}
          codeColorScheme={theme === 'dark' ? 'dark' : 'light'}
          isFocusMode={isFocusMode}
          onFocusModeChange={changeFocusMode}
          theme={theme}
          onThemeChange={setTheme}
          readerFontSize={readerFontSize}
          onReaderFontSizeChange={setReaderFontSize}
        />
      </main>
    </div>
  )
}

export default AppLayout
