import { useState } from 'react'
import type { ContentTopicMeta, WeeklyStudyProgram } from '../content/content-api'
import './StudyPlan.css'

type Props = { programs: WeeklyStudyProgram[]; topics: ContentTopicMeta[]; onOpenTopic: (slug: string) => void }
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const blocks = [['Learn / review', 20], ['Answer questions', 40], ['Investigate weak points', 20], ['Notes', 10]]

function weekKey() {
  const date = new Date(); const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

function StudyPlan({ programs, topics, onOpenTopic }: Props) {
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const program = programs.find((item) => item.id === selectedProgramId) ?? programs[0]

  if (!program) return <section className="study-empty"><h2>No weekly program published yet</h2><p>Choose any topic from the library while an administrator prepares a plan.</p></section>

  return <StudyProgram key={program.id} program={program} programs={programs} topics={topics} onOpenTopic={onOpenTopic} onSelectProgram={setSelectedProgramId} />
}

type StudyProgramProps = Props & {
  program: WeeklyStudyProgram
  onSelectProgram: (id: number) => void
}

function StudyProgram({ program, programs, topics, onOpenTopic, onSelectProgram }: StudyProgramProps) {
  const storageKey = `backend-engineering-notes:study:${program.id}:${weekKey()}`
  const [progress, setProgress] = useState<Record<number, { done: boolean; note: string }>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') as Record<number, { done: boolean; note: string }> } catch { return {} }
  })
  const update = (day: number, value: Partial<{ done: boolean; note: string }>) => {
    setProgress((current) => {
      const next = { ...current, [day]: { ...current[day], done: false, note: '', ...value } }
      localStorage.setItem(storageKey, JSON.stringify(next)); return next
    })
  }
  const complete = program.days.filter((day) => progress[day.dayOfWeek]?.done).length
  return <section className="study-plan-view">
    <div className="study-plan-heading"><div><p>Interview practice</p><h2>{program.name}</h2><span>{program.description || 'A repeatable weekly practice rhythm.'}</span></div><label>Program<select value={program.id} onChange={(event) => onSelectProgram(Number(event.target.value))}>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    <div className="study-progress"><strong>{complete} / 7 days complete</strong><div><span style={{ width: `${complete / 7 * 100}%` }} /></div><small>Week of {weekKey()}</small></div>
    <div className="study-rhythm"><strong>90-minute practice rhythm</strong>{blocks.map(([label, minutes]) => <span key={String(label)}>{minutes} min <em>{label}</em></span>)}</div>
    <div className="study-days">{[...program.days].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((day) => <article className={progress[day.dayOfWeek]?.done ? 'study-day complete' : 'study-day'} key={day.dayOfWeek}>
      <header><div><p>{days[day.dayOfWeek]}</p><h3>{day.theme}</h3><span>{day.minutes} minutes{day.note ? ` · ${day.note}` : ''}</span></div><label className="day-complete"><input type="checkbox" checked={progress[day.dayOfWeek]?.done || false} onChange={(event) => update(day.dayOfWeek, { done: event.target.checked })} /><span>Done</span></label></header>
      <div className="study-topics">{day.topicSlugs.map((slug) => <button key={slug} type="button" onClick={() => onOpenTopic(slug)}>{topics.find((topic) => topic.id === slug)?.title || slug}</button>)}</div>
      <label className="weak-points">Weak points / notes<textarea rows={2} value={progress[day.dayOfWeek]?.note || ''} onChange={(event) => update(day.dayOfWeek, { note: event.target.value })} placeholder="What needs another pass?" /></label>
    </article>)}</div>
  </section>
}
export default StudyPlan
