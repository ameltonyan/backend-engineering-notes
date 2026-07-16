import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import MarkdownPage from '../components/MarkdownPage'
import { contentProvider } from '../services/content/provider'
import type { ContentPageMeta } from '../content/content-api'
import './AppLayout.css'

function AppLayout() {
  const [pages, setPages] = useState<ContentPageMeta[]>([])
  const [activePageId, setActivePageId] = useState<string>('')
  const [pageMarkdown, setPageMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    window.localStorage.getItem('theme') === 'light' ? 'light' : 'dark',
  )

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId, pages],
  )

  useEffect(() => {
    contentProvider
      .getPageList()
      .then((list) => {
        setPages(list)
        setActivePageId((currentPageId) => currentPageId || list[0]?.id || '')
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
        if (!cancelled) setPageMarkdown(page.markdown)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load content')
          setPageMarkdown('')
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

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLightTheme={theme === 'light'}
        onThemeToggle={() => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')}
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
        />
        <MarkdownPage
          key={activePageId}
          markdown={pageMarkdown}
          loading={loading}
          error={error}
          pageId={activePage?.id}
        />
      </main>
    </div>
  )
}

export default AppLayout
