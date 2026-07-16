import type { ContentPageMeta } from '../content/content-api'
import logoUrl from '../assets/logo.svg'
import './Sidebar.css'

type SidebarProps = {
  pages: ContentPageMeta[]
  activePageId: string
  onSelectPage: (id: string) => void
  isOpen: boolean
  onClose: () => void
  isLightTheme: boolean
  onThemeToggle: () => void
}

function Sidebar({
  pages,
  activePageId,
  onSelectPage,
  isOpen,
  onClose,
  isLightTheme,
  onThemeToggle,
}: SidebarProps) {
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
        <img src={logoUrl} alt="Backend Engineering Notes" className="brand-logo" />
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
      <div className="sidebar-footer">
        <button
          className="theme-toggle"
          type="button"
          role="switch"
          aria-checked={isLightTheme}
          aria-label="Light theme"
          onClick={onThemeToggle}
        >
          <span className="theme-toggle-label">Light theme</span>
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
