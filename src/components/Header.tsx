import './Header.css'

type HeaderProps = {
  title: string
  section: string
  onMenuClick: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  previousPageTitle?: string
  nextPageTitle?: string
}

function Header({
  title,
  section,
  onMenuClick,
  onPreviousPage,
  onNextPage,
  previousPageTitle,
  nextPageTitle,
}: HeaderProps) {
  return (
    <header className="page-header">
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
        <div className="section-label-row">
          <p className="section-label">{section}</p>
          <div className="page-navigation" aria-label="Page navigation">
            <button
              type="button"
              aria-label={previousPageTitle ? `Previous page: ${previousPageTitle}` : 'No previous page'}
              title={previousPageTitle ? `Previous: ${previousPageTitle}` : 'No previous page'}
              disabled={!previousPageTitle}
              onClick={onPreviousPage}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label={nextPageTitle ? `Next page: ${nextPageTitle}` : 'No next page'}
              title={nextPageTitle ? `Next: ${nextPageTitle}` : 'No next page'}
              disabled={!nextPageTitle}
              onClick={onNextPage}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <h1>{title}</h1>
      </div>
    </header>
  )
}

export default Header
