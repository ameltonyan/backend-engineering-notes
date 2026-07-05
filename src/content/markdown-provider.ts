import type { ContentProvider, ContentPageData, ContentPageMeta } from './content-api'

const manifestPath = '/content/manifest.json'

export class MarkdownContentProvider implements ContentProvider {
  async getPageList(): Promise<ContentPageMeta[]> {
    const res = await fetch(manifestPath)
    if (!res.ok) {
      throw new Error('Unable to load content manifest')
    }
    return (await res.json()) as ContentPageMeta[]
  }

  async getPageData(id: string): Promise<ContentPageData> {
    const pages = await this.getPageList()
    const page = pages.find((item) => item.id === id)
    if (!page) {
      throw new Error(`Page not found: ${id}`)
    }

    const response = await fetch(page.path)
    if (!response.ok) {
      throw new Error(`Unable to load content: ${page.path}`)
    }

    const markdown = await response.text()

    return {
      id: page.id,
      title: page.title,
      section: page.section,
      markdown,
    }
  }
}
