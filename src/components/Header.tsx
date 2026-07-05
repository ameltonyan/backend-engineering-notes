import './Header.css'

type HeaderProps = {
  title: string
  section: string
}

function Header({ title, section }: HeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="section-label">{section}</p>
        <h1>{title}</h1>
      </div>
    </header>
  )
}

export default Header
