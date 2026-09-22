import { useState } from 'react'
import type { ContentPageMeta, Difficulty } from '../content/content-api'
import { fontSizeOptions, themeOptions } from '../reading-preferences'
import type { ReaderFontSize, ReadingTheme } from '../reading-preferences'
import logoUrl from '../assets/logo.svg'
import './Sidebar.css'

type SidebarProps = {
  pages: ContentPageMeta[]
  activePageId: string
  onSelectPage: (id: string) => void
  collapsedSections: Record<string, boolean>
  onToggleSection: (section: string) => void
  isOpen: boolean
  onClose: () => void
  theme: ReadingTheme
  onThemeChange: (theme: ReadingTheme) => void
  readerFontSize: ReaderFontSize
  onReaderFontSizeChange: (size: ReaderFontSize) => void
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
}

function Sidebar({
  pages,
  activePageId,
  onSelectPage,
  collapsedSections,
  onToggleSection,
  isOpen,
  onClose,
  theme,
  onThemeChange,
  readerFontSize,
  onReaderFontSizeChange,
  difficulty,
  onDifficultyChange,
}: SidebarProps) {
  const [areReadingPreferencesOpen, setAreReadingPreferencesOpen] = useState(true)
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
          className="reading-preferences-toggle"
          type="button"
          aria-label={areReadingPreferencesOpen ? 'Hide reading preferences' : 'Show reading preferences'}
          aria-expanded={areReadingPreferencesOpen}
          aria-controls="reading-preferences"
          title={areReadingPreferencesOpen ? 'Hide reading preferences' : 'Show reading preferences'}
          onClick={() => setAreReadingPreferencesOpen((open) => !open)}
        >
          <span aria-hidden="true">⚙</span>
          <span className="reading-preferences-indicator" aria-hidden="true">{areReadingPreferencesOpen ? '−' : '+'}</span>
        </button>
        {areReadingPreferencesOpen && (
          <div id="reading-preferences" className="reading-preferences" aria-label="Reading preferences">
            <div className="preference-options theme-options" role="group" aria-label="Color theme">
              {themeOptions.map((option) => (
                <button
                  className={theme === option.value ? 'preference-button selected theme-option' : 'preference-button theme-option'}
                  data-reading-theme={option.value}
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
            <div className="preference-options font-size-options" role="group" aria-label="Reading text size">
              {fontSizeOptions.map((option) => (
                <button
                  className={readerFontSize === option.value ? 'preference-button selected font-size-option' : 'preference-button font-size-option'}
                  data-reading-size={option.value}
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
      </div>

      <fieldset className="difficulty-selector">
        <legend>Difficulty level</legend>
        <div className="difficulty-options">
          {([
            ['BEGINNER', 'Beginner'],
            ['INTERMEDIATE', 'Intermediate'],
            ['ADVANCED', 'Advanced'],
            ['EXPERT', 'Expert'],
          ] as const).map(([value, label]) => (
            <button
              className={difficulty === value ? 'difficulty-option selected' : 'difficulty-option'}
              type="button"
              aria-pressed={difficulty === value}
              key={value}
              onClick={() => onDifficultyChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="nav-section">
        {!pages.length && <p className="difficulty-empty">No published content at this level yet.</p>}
        {sectionNames.map((section) => (
          <div className="sidebar-section" key={section}>
            <div className="section-group-title">
              <button
                className="section-group-title-button"
                type="button"
                aria-expanded={!collapsedSections[section]}
                onClick={() => onToggleSection(section)}
              >
                {section}
              </button>
              <button
                className="section-collapse-toggle"
                type="button"
                aria-expanded={!collapsedSections[section]}
                aria-label={`${collapsedSections[section] ? 'Expand' : 'Collapse'} ${section}`}
                title={`${collapsedSections[section] ? 'Expand' : 'Collapse'} ${section}`}
                onClick={() => onToggleSection(section)}
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
