import { useState } from 'react'
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const sortedPages = [...pages].sort((left, right) =>
    left.sectionDisplayOrder - right.sectionDisplayOrder
    || left.displayOrder - right.displayOrder
    || left.title.localeCompare(right.title),
  )
  const sections = sortedPages.reduce((acc, page) => {
    const key = page.section || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(page)
    return acc
  }, {} as Record<string, ContentPageMeta[]>)

  const sectionNames = Object.keys(sections)
  const toggleSection = (section: string) => {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  return (
    <aside
      id="site-navigation"
      className={isOpen ? 'sidebar open' : 'sidebar'}
      aria-label="Site navigation"
    >
      <div className="brand">
        <img src={logoUrl} alt="Backend Engineering Notes" className="brand-logo" />
        <div className="brand-details">
          <span className="brand-title">Backend Engineering Notes</span>
        </div>
        <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}>
          ×
        </button>
        <button
          className="theme-toggle"
          type="button"
          role="switch"
          aria-checked={isLightTheme}
          aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
          onClick={onThemeToggle}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </button>
      </div>

      <div className="nav-section">
        {sectionNames.map((section) => (
          <div className="sidebar-section" key={section}>
            <div className="section-group-title">
              <button
                className="section-group-title-button"
                type="button"
                aria-expanded={!collapsedSections[section]}
                onClick={() => toggleSection(section)}
              >
                {section}
              </button>
              <button
                className="section-collapse-toggle"
                type="button"
                aria-expanded={!collapsedSections[section]}
                aria-label={`${collapsedSections[section] ? 'Expand' : 'Collapse'} ${section}`}
                title={`${collapsedSections[section] ? 'Expand' : 'Collapse'} ${section}`}
                onClick={() => toggleSection(section)}
              >
                <span className="section-collapse-icon" aria-hidden="true" />
              </button>
            </div>
            {!collapsedSections[section] && (
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
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
