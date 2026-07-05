import type { ContentPageMeta } from '../content/content-api'
import './Sidebar.css'

type SidebarProps = {
  pages: ContentPageMeta[]
  activePageId: string
  onSelectPage: (id: string) => void
}

function Sidebar({ pages, activePageId, onSelectPage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">Backend Engineering Notes</div>
      <div className="nav-section">
        <div className="nav-section-title">Sections</div>
        {pages.map((page) => (
          <button
            key={page.id}
            className={page.id === activePageId ? 'nav-item active' : 'nav-item'}
            onClick={() => onSelectPage(page.id)}
          >
            {page.title}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
