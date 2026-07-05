import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownPage.css'

type MarkdownPageProps = {
  markdown: string
  loading: boolean
  error: string | null
}

function MarkdownPage({ markdown, loading, error }: MarkdownPageProps) {
  return (
    <div className="content-card">
      {loading && <p className="status">Loading content...</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && (
        <article className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>
      )}
    </div>
  )
}

export default MarkdownPage
