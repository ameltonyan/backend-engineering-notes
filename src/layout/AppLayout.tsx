import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import QuestionReader from '../components/QuestionReader'
import { contentProvider } from '../services/content/provider'
import type { ContentPageData, ContentPageMeta } from '../content/content-api'
import './AppLayout.css'

const lastActivePageStorageKey = 'backend-engineering-notes:last-active-page'
const sidebarCollapsedStorageKey = 'backend-engineering-notes:sidebar-collapsed'
const readerFontSizeStorageKey = 'backend-engineering-notes:reader-font-size'

type ReadingTheme = 'dark' | 'light' | 'paper' | 'sepia'
type ReaderFontSize = 'small' | 'standard' | 'large'

function savedTheme(): ReadingTheme {
  const value = window.localStorage.getItem('theme')
  return value === 'light' || value === 'paper' || value === 'sepia' ? value : 'dark'
}

function savedReaderFontSize(): ReaderFontSize {
  const value = window.localStorage.getItem(readerFontSizeStorageKey)
  return value === 'small' || value === 'large' ? value : 'standard'
}

function AppLayout() {
  const [pages, setPages] = useState<ContentPageMeta[]>([])
  const [activePageId, setActivePageId] = useState<string>('')
  const [pageData, setPageData] = useState<ContentPageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    window.localStorage.getItem(sidebarCollapsedStorageKey) === 'true',
  )
  const [theme, setTheme] = useState<ReadingTheme>(savedTheme)
  const [readerFontSize, setReaderFontSize] = useState<ReaderFontSize>(savedReaderFontSize)

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId, pages],
  )
  const activePageIndex = pages.findIndex((page) => page.id === activePage?.id)
  const previousPage = activePageIndex > 0 ? pages[activePageIndex - 1] : undefined
  const nextPage = activePageIndex >= 0 ? pages[activePageIndex + 1] : undefined

  const selectPage = (pageId: string) => {
    if (pageId === activePageId) return

    setPageData(null)
    setActivePageId(pageId)
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  const openActiveSection = () => {
    const section = activePage?.section || 'Other'
    setCollapsedSections((current) => ({ ...current, [section]: false }))
    setIsSidebarCollapsed(false)
    setIsSidebarOpen(true)
  }

  useEffect(() => {
    contentProvider
      .getPageList()
      .then((list) => {
        setPages(list)
        setActivePageId((currentPageId) => {
          if (currentPageId) return currentPageId

          const savedPageId = window.localStorage.getItem(lastActivePageStorageKey)
          return list.some((page) => page.id === savedPageId)
            ? savedPageId!
            : list[0]?.id || ''
        })
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!activePageId) {
      return
    }

    let cancelled = false

    const loadPage = async () => {
      setLoading(true)
      setError(null)

      try {
        const page = await contentProvider.getPageData(activePageId)
        if (!cancelled) {
          setPageData(page)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load content')
          setPageData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPage()
    return () => {
      cancelled = true
    }
  }, [activePageId])

  useEffect(() => {
    if (activePageId) {
      window.localStorage.setItem(lastActivePageStorageKey, activePageId)
    }
  }, [activePageId])

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

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={selectPage}
        collapsedSections={collapsedSections}
        onToggleSection={toggleSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        readerFontSize={readerFontSize}
        onReaderFontSizeChange={setReaderFontSize}
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
          title={activePage?.title ?? 'Loading page'}
          section={activePage?.section ?? 'Loading'}
          onMenuClick={() => setIsSidebarOpen(true)}
          onOpenActiveSection={openActiveSection}
          onPreviousPage={() => previousPage && selectPage(previousPage.id)}
          onNextPage={() => nextPage && selectPage(nextPage.id)}
          previousPageTitle={previousPage?.title}
          nextPageTitle={nextPage?.title}
        />
        <QuestionReader
          key={activePageId}
          page={pageData}
          loading={loading}
          error={error}
          pageId={activePage?.id}
        />
      </main>
    </div>
  )
}

export default AppLayout
