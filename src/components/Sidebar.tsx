import type { ContentPageMeta } from '../content/content-api'
import './Sidebar.css'

type SidebarProps = {
  pages: ContentPageMeta[]
  activePageId: string
  onSelectPage: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ pages, activePageId, onSelectPage, isOpen, onClose }: SidebarProps) {
  const sections = pages.reduce((acc, page) => {
    const key = page.section || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(page)
    return acc
  }, {} as Record<string, ContentPageMeta[]>)

  const sectionNames = Object.keys(sections)

  return (
    <aside
      id="site-navigation"
      className={isOpen ? 'sidebar open' : 'sidebar'}
      aria-label="Site navigation"
    >
      <div className="brand">
        <img src="/assets/logo.svg" alt="Backend Engineering Notes" className="brand-logo" />
        <span>Backend Engineering Notes</span>
        <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="nav-section">
        {sectionNames.map((section) => (
          <div className="sidebar-section" key={section}>
            <div className="section-group-title">{section}</div>
            <div className="section-items">
              {sections[section].map((page) => (
                <button
                  key={page.id}
                  className={page.id === activePageId ? 'nav-item active' : 'nav-item'}
                  onClick={() => {
                    onSelectPage(page.id)
                    onClose()
                  }}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
