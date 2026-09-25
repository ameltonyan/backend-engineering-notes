import './Header.css'

type HeaderProps = {
  title: string
  category: string
  onMenuClick: () => void
  onOpenActiveCategory: () => void
  onPreviousTopic: () => void
  onNextTopic: () => void
  previousTopicTitle?: string
  nextTopicTitle?: string
}

function Header({
  title,
  category,
  onMenuClick,
  onOpenActiveCategory,
  onPreviousTopic,
  onNextTopic,
  previousTopicTitle,
  nextTopicTitle,
}: HeaderProps) {
  return (
    <header className="topic-header">
      <button
        className="menu-button"
        type="button"
        aria-label="Open navigation"
        aria-controls="site-navigation"
        onClick={onMenuClick}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <div>
        <div className="category-label-row">
          <p className="category-label">{category}</p>
          <div className="topic-navigation" aria-label="Topic navigation">
            <button
              type="button"
              aria-label={previousTopicTitle ? `Previous topic: ${previousTopicTitle}` : 'No previous topic'}
              title={previousTopicTitle ? `Previous: ${previousTopicTitle}` : 'No previous topic'}
              disabled={!previousTopicTitle}
              onClick={onPreviousTopic}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label={nextTopicTitle ? `Next topic: ${nextTopicTitle}` : 'No next topic'}
              title={nextTopicTitle ? `Next: ${nextTopicTitle}` : 'No next topic'}
              disabled={!nextTopicTitle}
              onClick={onNextTopic}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <h1>
            <button className="topic-title-button" type="button" onClick={onOpenActiveCategory}>
              {title}
            </button>
          </h1>
        </div>
      </div>
    </header>
  )
}

export default Header
