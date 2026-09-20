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
  tags: string[]
  displayOrder: number
  depth: number
}

export type StudyDay = {
  dayOfWeek: number
  theme: string
  pageSlugs: string[]
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
  getPageList(): Promise<ContentPageMeta[]>
  getPageData(id: string): Promise<ContentPageData>
  getStudyPrograms(): Promise<WeeklyStudyProgram[]>
}
