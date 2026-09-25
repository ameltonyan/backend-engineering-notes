import type { ContentPageData, ContentPageMeta, ContentProvider, ContentQuestion, Difficulty, WeeklyStudyProgram } from './content-api'

type ApiPageSummary = {
  slug: string
  title: string
  section: string
  sectionDisplayOrder: number
  displayOrder: number
}

type ApiQuestionAnswer = ContentQuestion

type ApiPageResponse = {
  slug: string
  title: string
  description: string | null
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
    sectionDisplayOrder: page.sectionDisplayOrder,
    displayOrder: page.displayOrder,
  }
}

export class ApiContentProvider implements ContentProvider {
  async getStudyPrograms(): Promise<WeeklyStudyProgram[]> {
    const response = await fetch(buildApiUrl('/api/study-programs'))
    if (!response.ok) throw new Error(`Unable to load study programs (${response.status})`)
    return (await response.json()) as WeeklyStudyProgram[]
  }

  async getPageList(difficulty: Difficulty): Promise<ContentPageMeta[]> {
    const response = await fetch(buildApiUrl(`/api/pages?difficulty=${encodeURIComponent(difficulty)}`))
    if (!response.ok) {
      throw new Error(`Unable to load page list (${response.status})`)
    }

    const pages = (await response.json()) as ApiPageSummary[]
    return pages
      .sort((left, right) =>
        left.sectionDisplayOrder - right.sectionDisplayOrder
        || left.displayOrder - right.displayOrder
        || left.title.localeCompare(right.title),
      )
      .map(toPageMeta)
  }

  async getPageData(id: string, difficulty: Difficulty): Promise<ContentPageData> {
    const response = await fetch(buildApiUrl(`/api/pages/${encodeURIComponent(id)}?difficulty=${encodeURIComponent(difficulty)}`))
    if (!response.ok) {
      throw new Error(`Unable to load page "${id}" (${response.status})`)
    }

    const page = (await response.json()) as ApiPageResponse
    return {
      id: page.slug,
      title: page.title,
      section: page.section,
      description: page.description,
      questions: page.questions
        .map((question) => ({
          ...question,
          example: question.example?.trim() || null,
          codeSnippet: question.codeSnippet?.trim() || null,
          tags: question.tags ?? [],
        })),
    }
  }
}
