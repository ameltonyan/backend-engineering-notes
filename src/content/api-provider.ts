import type { ContentTopicData, ContentTopicMeta, ContentProvider, ContentQuestion, Difficulty, WeeklyStudyProgram } from './content-api'

type ApiTopicSummary = {
  slug: string
  title: string
  category: string
  categoryDisplayOrder: number
  displayOrder: number
}

type ApiQuestionAnswer = ContentQuestion

type ApiTopicResponse = {
  slug: string
  title: string
  description: string | null
  category: string
  displayOrder: number
  questions: ApiQuestionAnswer[]
}


function buildApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080'
  return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

function toTopicMeta(topic: ApiTopicSummary): ContentTopicMeta {
  return {
    id: topic.slug,
    title: topic.title,
    category: topic.category,
    categoryDisplayOrder: topic.categoryDisplayOrder,
    displayOrder: topic.displayOrder,
  }
}

export class ApiContentProvider implements ContentProvider {
  async getStudyPrograms(): Promise<WeeklyStudyProgram[]> {
    const response = await fetch(buildApiUrl('/api/study-programs'))
    if (!response.ok) throw new Error(`Unable to load study programs (${response.status})`)
    return (await response.json()) as WeeklyStudyProgram[]
  }

  async getTopicList(difficulty: Difficulty): Promise<ContentTopicMeta[]> {
    const response = await fetch(buildApiUrl(`/api/topics?difficulty=${encodeURIComponent(difficulty)}`))
    if (!response.ok) {
      throw new Error(`Unable to load topic list (${response.status})`)
    }

    const topics = (await response.json()) as ApiTopicSummary[]
    return topics
      .sort((left, right) =>
        left.categoryDisplayOrder - right.categoryDisplayOrder
        || left.displayOrder - right.displayOrder
        || left.title.localeCompare(right.title),
      )
      .map(toTopicMeta)
  }

  async getTopicData(id: string, difficulty: Difficulty): Promise<ContentTopicData> {
    const response = await fetch(buildApiUrl(`/api/topics/${encodeURIComponent(id)}?difficulty=${encodeURIComponent(difficulty)}`))
    if (!response.ok) {
      throw new Error(`Unable to load topic "${id}" (${response.status})`)
    }

    const topic = (await response.json()) as ApiTopicResponse
    return {
      id: topic.slug,
      title: topic.title,
      category: topic.category,
      description: topic.description,
      questions: topic.questions
        .map((question) => ({
          ...question,
          example: question.example?.trim() || null,
          codeSnippet: question.codeSnippet?.trim() || null,
          tags: question.tags ?? [],
        })),
    }
  }
}
