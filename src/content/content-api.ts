export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

export type ContentTopicMeta = {
  id: string
  title: string
  category: string
  categoryDisplayOrder: number
  displayOrder: number
  path?: string
}

export type ContentTopicData = {
  id: string
  title: string
  category: string
  description: string | null
  questions: ContentQuestion[]
}

export type ContentQuestion = {
  id: number
  parentQuestionId: number | null
  question: string
  answer: string
  example: string | null
  codeSnippet: string | null
  difficulty: Difficulty
  tags: string[]
  displayOrder: number
  depth: number
}

export type StudyDay = {
  dayOfWeek: number
  theme: string
  topicSlugs: string[]
  minutes: number
  note: string | null
}

export type WeeklyStudyProgram = {
  id: number
  name: string
  description: string | null
  days: StudyDay[]
  displayOrder: number
}

export interface ContentProvider {
  getTopicList(difficulty: Difficulty): Promise<ContentTopicMeta[]>
  getTopicData(id: string, difficulty: Difficulty): Promise<ContentTopicData>
  getStudyPrograms(): Promise<WeeklyStudyProgram[]>
}
