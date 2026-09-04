import type { ContentPageData, ContentPageMeta, ContentProvider } from './content-api'

type ApiPageSummary = {
  slug: string
  title: string
  section: string
  displayOrder: number
}

type ApiQuestionAnswer = {
  id: number
  question: string
  answer: string
  displayOrder: number
}

type ApiPageResponse = {
  slug: string
  title: string
  section: string
  displayOrder: number
  questions: ApiQuestionAnswer[]
}

function buildApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'
  return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

function toPageMeta(page: ApiPageSummary): ContentPageMeta {
  return {
    id: page.slug,
    title: page.title,
    section: page.section,
  }
}

function buildMarkdown(page: ApiPageResponse) {
  const sortedQuestions = [...page.questions].sort((left, right) => left.displayOrder - right.displayOrder)

  if (!sortedQuestions.length) {
    return '_No notes available yet._'
  }

  return sortedQuestions
    .map((questionAnswer) => `## ${questionAnswer.question}\n\n${questionAnswer.answer}`)
    .join('\n\n')
}

export class ApiContentProvider implements ContentProvider {
  async getPageList(): Promise<ContentPageMeta[]> {
    const response = await fetch(buildApiUrl('/api/pages'))
    if (!response.ok) {
      throw new Error(`Unable to load page list (${response.status})`)
    }

    const pages = (await response.json()) as ApiPageSummary[]
    return pages
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(toPageMeta)
  }

  async getPageData(id: string): Promise<ContentPageData> {
    const response = await fetch(buildApiUrl(`/api/pages/${encodeURIComponent(id)}`))
    if (!response.ok) {
      throw new Error(`Unable to load page "${id}" (${response.status})`)
    }

    const page = (await response.json()) as ApiPageResponse
    return {
      id: page.slug,
      title: page.title,
      section: page.section,
      markdown: buildMarkdown(page),
    }
  }
}
