import { ApiContentProvider } from '../../content/api-provider'
import { MarkdownContentProvider } from '../../content/markdown-provider'

const contentSource = import.meta.env.VITE_CONTENT_SOURCE?.toLowerCase() ?? 'api'

export const contentProvider =
  contentSource === 'markdown' ? new MarkdownContentProvider() : new ApiContentProvider()
