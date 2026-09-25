import { useState } from 'react'
import type { ContentTopicMeta, Difficulty } from '../content/content-api'
import { fontSizeOptions, themeOptions } from '../reading-preferences'
import type { ReaderFontSize, ReadingTheme } from '../reading-preferences'
import logoUrl from '../assets/logo.svg'
import './Sidebar.css'

type SidebarProps = {
  topics: ContentTopicMeta[]
  activeTopicId: string
  onSelectTopic: (id: string) => void
  collapsedCategories: Record<string, boolean>
  onToggleCategory: (category: string) => void
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
  topics,
  activeTopicId,
  onSelectTopic,
  collapsedCategories,
  onToggleCategory,
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
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(true)
  const difficultyLabel = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert',
  }[difficulty]
  const sortedTopics = [...topics].sort((left, right) =>
    left.categoryDisplayOrder - right.categoryDisplayOrder
    || left.displayOrder - right.displayOrder
    || left.title.localeCompare(right.title),
  )
  const categories = sortedTopics.reduce((acc, topic) => {
    const key = topic.category || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(topic)
    return acc
  }, {} as Record<string, ContentTopicMeta[]>)

  const categoryNames = Object.keys(categories)

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
          <span className="reading-preferences-indicator" aria-hidden="true" />
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

      <div className="difficulty-selector">
        <button
          className="difficulty-toggle"
          type="button"
          aria-expanded={isDifficultyOpen}
          aria-controls="difficulty-options"
          aria-label={`${isDifficultyOpen ? 'Hide' : 'Show'} difficulty levels. Current level: ${difficultyLabel}`}
          onClick={() => setIsDifficultyOpen((open) => !open)}
        >
          <span className="difficulty-toggle-copy">
            <span>Difficulty</span>
            <strong>{difficultyLabel}</strong>
          </span>
          <span className="difficulty-toggle-indicator" aria-hidden="true" />
        </button>
        {isDifficultyOpen && (
          <div className="difficulty-options" id="difficulty-options" role="group" aria-label="Difficulty level">
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
        )}
      </div>

      <div className="nav-category">
        {!topics.length && <p className="difficulty-empty">No published content at this level yet.</p>}
        {categoryNames.map((category) => (
          <div className="sidebar-category" key={category}>
            <div className="category-group-title">
              <button
                className="category-group-title-button"
                type="button"
                aria-expanded={!collapsedCategories[category]}
                onClick={() => onToggleCategory(category)}
              >
                {category}
              </button>
              <button
                className="category-collapse-toggle"
                type="button"
                aria-expanded={!collapsedCategories[category]}
                aria-label={`${collapsedCategories[category] ? 'Expand' : 'Collapse'} ${category}`}
                title={`${collapsedCategories[category] ? 'Expand' : 'Collapse'} ${category}`}
                onClick={() => onToggleCategory(category)}
              >
                <span className="category-collapse-icon" aria-hidden="true" />
              </button>
            </div>
            {!collapsedCategories[category] && (
              <div className="category-items">
                {categories[category].map((topic) => (
                  <button
                    key={topic.id}
                    className={topic.id === activeTopicId ? 'nav-item active' : 'nav-item'}
                    onClick={() => {
                      onSelectTopic(topic.id)
                      onClose()
                    }}
                  >
                    {topic.title}
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
