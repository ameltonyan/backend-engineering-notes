export type ContentPageMeta = {
  id: string
  title: string
  section: string
  sectionDisplayOrder: number
  displayOrder: number
  path?: string
}

export type ContentPageData = {
  id: string
  title: string
  section: string
  markdown: string
}

export interface ContentProvider {
  getPageList(): Promise<ContentPageMeta[]>
  getPageData(id: string): Promise<ContentPageData>
}
