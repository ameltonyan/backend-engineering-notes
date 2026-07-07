import './Header.css'

type HeaderProps = {
  title: string
  section: string
  onMenuClick: () => void
}

function Header({ title, section, onMenuClick }: HeaderProps) {
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
        <p className="section-label">{section}</p>
        <h1>{title}</h1>
      </div>
    </header>
  )
}

export default Header
