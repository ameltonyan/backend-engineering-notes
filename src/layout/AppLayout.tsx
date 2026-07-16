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

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId, pages],
  )

  useEffect(() => {
    contentProvider
      .getPageList()
      .then((list) => {
        setPages(list)
        if (!activePageId && list.length) {
          setActivePageId(list[0].id)
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!activePageId) {
      return
    }

    setLoading(true)
    setError(null)
    contentProvider
      .getPageData(activePageId)
      .then((page) => setPageMarkdown(page.markdown))
      .catch((err) => {
        setError(err.message)
        setPageMarkdown('')
      })
      .finally(() => setLoading(false))
  }, [activePageId])

  useEffect(() => {
    if (!isSidebarOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isSidebarOpen])

  return (
    <div className="app-shell">
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
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
