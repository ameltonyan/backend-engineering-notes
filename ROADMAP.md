# Backend Engineering Notes — Product Roadmap

## Purpose

Build an interview-preparation product that helps backend engineers remember concepts, practise answers, understand the reasoning behind them, and follow a realistic study plan.

The product has two deliberately different experiences:

| Area | Purpose |
| --- | --- |
| Admin application | Create, review, improve, organize, and publish interview content and learning-program templates. |
| Learner application | A calm, distraction-free reader with personal plans, progress tracking, and, later, grounded AI help. |

## Current foundation

The project already has:

- Separate React public and admin applications.
- A Spring Boot/PostgreSQL API.
- Admin CRUD for sections, pages, questions, and answers.
- AI-assisted question generation and answer improvement, with human review before saving.
- Question parent/child relationships in the API data model, suitable for interviewer follow-ups.
- Publishable weekly study-program templates.

Current gaps to close:

- The public reader does not yet display follow-up-question hierarchy.
- Examples and optional code snippets are not first-class content fields.
- Study progress is browser-local, not associated with a learner account.
- Weekly programs are templates, not personalized learner plans.
- Learner registration, profiles, and secure persistence do not exist yet.

## Production database and backups

**Current production database:** Supabase PostgreSQL. The Oracle Cloud VM hosts the API; it is not the current primary database.

Keep the application portable: Flyway migrations in the API repository are the source of truth for schema changes, and backups must be standard PostgreSQL logical exports that can restore to Supabase, Oracle-hosted PostgreSQL, or another PostgreSQL provider.

### Backup policy — complete before inviting active testers

- Back up the **whole database** (roles, schema, and data), not individual tables by default. Take a targeted table export only before unusually risky manual data work.
- Use `supabase db dump` to produce separate roles, schema, and data exports; it filters Supabase-managed internals and is suitable for later migration.
- Compress and encrypt every backup archive. Keep credentials and encryption/recovery material outside Git and outside the public frontend.
- Upload daily archives to a **private OCI Object Storage bucket**, separate from Supabase. Keep a separate encrypted monthly copy under the owner's control as a third copy.
- Retain 7 daily, 4 weekly, and 12 monthly backups; use bucket lifecycle rules to expire older files.
- Run a monthly restore into a disposable PostgreSQL database, start the API against it, and verify expected tables and row counts. A backup that has never been restored is not verified.

### Immediate operational checklist

1. Record the current database size, PostgreSQL version, enabled extensions, and connection method.
2. Take one manual encrypted export and upload it to the OCI bucket.
3. Restore that export into a disposable database and document the exact restore steps.
4. Automate the daily export only after the manual restore succeeds; alert on a failed export or upload.
5. Before moving away from Supabase, run a full migration rehearsal from an off-site backup into the chosen PostgreSQL target.

Supabase provider backups are useful but not sufficient as the only recovery plan. Their free-tier guidance recommends regular off-site logical exports; deleted projects remove associated provider backups. See [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups) and [Supabase CLI backup/restore documentation](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

## Product principles

1. **Practise before revealing.** Let a learner think or speak an answer before seeing it.
2. **Progressive disclosure.** Keep answers, examples, code snippets, and follow-ups hidden until requested.
3. **Calm reading over dashboard noise.** The reader should have only essential controls visible.
4. **Human-reviewed AI.** AI proposes content; an administrator approves, edits, or discards it.
5. **One source of truth.** Public content, admin preview, and plans should use the same published content model.
6. **Accessible by default.** Keyboard navigation, focus visibility, sufficient contrast, reduced motion, and readable type are requirements, not polish.

## Content production — daily quality lane

Content quality is a continuous product task, not work deferred to Week 7. Start now and continue every day through the roadmap.

### Daily target

Create and review:

- **1 root question/answer**, and
- **1 direct likely interviewer follow-up question/answer**.

This creates 2 reviewed question records per day. At a seven-day pace, eight weeks yields up to 56 root questions and 56 follow-ups. Quality takes priority: skip publication rather than publish an answer that has not passed review.

### Daily workflow

1. Select one narrow concept from the current topic plan.
2. Create a draft manually or with AI.
3. Verify technical correctness against authoritative documentation or a trusted primary source.
4. Edit it into a concise spoken interview answer; add a realistic example and code only where it improves understanding.
5. Check that the follow-up is a plausible next interviewer question, not merely another related fact.
6. Mark the item `reviewed`; publish it only when it is ready for learners.
7. Record the topic, question IDs, status, and source in a simple content ledger.

### AI authoring

An OpenAI API key is an authoring accelerator, not a dependency for beginning this daily lane. Until a key is available, write drafts manually or use the existing mock provider to exercise the workflow.

When an OpenAI key is added, configure it **only on the API server** as `OPENAI_API_KEY`; never place it in frontend code, Git, or the admin UI. Use it to draft questions, follow-ups, examples, and optional code snippets, then apply the same human review workflow. Official OpenAI guidance is to keep API keys in server environment variables or secret management rather than client-side code. See [OpenAI API security guidance](https://platform.openai.com/docs/api-reference/backward-compatibility?lang=ruby).

### Local and production discipline

- **Local database:** draft and staging environment.
- **Production Supabase database:** reviewed/published learner content only.
- Do not make unrelated manual edits to the same question in both databases; they will drift and are not a reliable backup strategy.
- Until off-site daily backups are proven, immediately export the production database after each publishing session and keep the encrypted export locally. This is a temporary safety net, not a substitute for the scheduled off-site backup policy.
- The content ledger and Flyway migrations belong in Git; production data exports do not.

## Core data decisions

### Question content

Treat follow-ups as real questions, not prose embedded in an answer.

```text
Question
- question
- shortAnswer                 # concise interview answer, initially revealable
- example                     # optional: practical / production scenario
- codeSnippet                 # optional: code only when it clarifies the answer
- parentQuestionId            # null for a root question; otherwise a likely follow-up
- displayOrder
- difficulty
- tags
- status: draft | reviewed | published
```

The existing `parentQuestionId` relationship should be returned by the public API and rendered by the learner application.

### Learning plans

Do **not** create separate daily, weekly, and monthly plan models. Use one personal plan with date-based items; the time period is only a UI view.

```text
PersonalPlan
  └── PlanItem
        - scheduledDate
        - content target (page and/or question)
        - estimatedMinutes
        - status
        - learner note
        - confidence rating
```

From this same data, provide Today, This Week, and This Month views.

### Plan types

Keep these concepts separate:

- **Study-program template:** an administrator-created reusable rhythm or curriculum.
- **Personal plan:** a learner's dated copy tailored to their target role, target date, availability, and selected subjects.

## Public reader direction

The question card should follow this structure:

```text
Question
[Try answering first]

[Reveal answer]

▸ Why this answer works
▸ Example in production
▸ Likely follow-up questions (2)
```

Reader requirements:

- Keep previous/next navigation and a quiet progress indicator visible.
- Put font-size controls and theme selection behind one compact `Aa` menu.
- Persist preferences locally for guests and to the account for signed-in learners.
- Offer only three themes: Light, Dark, and Warm/Paper.
- Aim for balanced type: question around `1.35–1.65rem`; answer around `1.05–1.15rem` with line-height around `1.7`.
- Do not show examples, code snippets, or follow-ups until the learner chooses to expand them.
- Support keyboard navigation and mobile-friendly reading.

## Solo working method

Use one-week iterations instead of heavyweight Scrum ceremonies.

- **Monday:** choose one weekly outcome and 3–5 small tasks.
- **Each day:** complete one main build task, one verification task, and add a short project note.
- **Friday:** test the whole user flow on desktop and mobile; deploy only when stable.
- Keep work in progress to one feature at a time.
- Put new ideas in a `Later` backlog rather than interrupting the current outcome.

### Definition of done

A feature is done only when it:

- Works on desktop and mobile.
- Handles loading, empty, and error states.
- Includes API validation and a migration if persisted data changes.
- Has an automated test for important server logic.
- Is usable without a mouse where practical.
- Has no unresolved privacy or security issue.

## Product analytics

### Decision

Use **PostHog Cloud (EU project) on its free tier** for the first alpha and beta. Do not build analytics in-house or self-host it yet. It provides custom events, funnels, and seven-day retention without operating another service.

Start it in Week 1, before inviting the first 10 testers. The initial setup is about one focused day; add later events alongside the feature that creates them. Create one frontend analytics wrapper (for example, `src/analytics/analytics.ts`) so components do not call the vendor library directly.

**Delivery schedule:** Day 5 — provider setup, privacy choice, wrapper, and `question viewed`; Day 6 — follow-up event; Day 8 — answer/example/code events; Day 14 — verify the dashboard and event data. Add `user signed up`, `plan created`, and `study item completed` only in the later weeks where those features are built.

### Events

Track explicit meaningful actions only; disable or avoid broad automatic click tracking.

| Event | When to send it | Allowed properties |
| --- | --- | --- |
| `question viewed` | A question first becomes visible in a browser session | `page_slug`, `section`, `question_index`, `depth` |
| `answer revealed` | Learner reveals an answer | `page_slug`, `question_index` |
| `detail opened` | Example, code snippet, or follow-up is opened | `detail_type`, `page_slug`, `question_index` |
| `study item completed` | Completion has been successfully saved by the API | `plan_type`, `scheduled_date`, `estimated_minutes` |
| `plan created` | Personal plan is saved | `duration_days`, `target_role` |
| `user signed up` | Registration succeeds | `signup_method` |

Never send email addresses, question/answer text, free-form learner notes, passwords, tokens, or secrets as analytics properties. Track each question view once per session to avoid noisy duplicate events.

### First dashboards

1. Reader funnel: `question viewed` → `answer revealed` → `detail opened`.
2. Learning funnel: `plan created` → first study item opened → `study item completed`.
3. Seven-day learning retention: a learner reveals an answer, then reveals an answer again within seven days.

For registered learners, identify analytics with the internal user ID only, never email. Add a clear accept/reject analytics choice before persistent tracking begins; the reader must continue to work when analytics is rejected.

## Eight-week implementation plan

### Week 1 — Reader data model and follow-ups

| Day | Outcome |
| --- | --- |
| 1 | Write the learner journey and finalize question fields: short answer, example, optional code snippet, tags, status. |
| 2 | Add the database migration and API DTO changes for example, optional code snippet, tags, and publishing status. |
| 3 | Update admin forms to create and edit the new content fields. |
| 4 | Return `parentQuestionId` and depth from the public API. |
| 5 | Replace public markdown-only question conversion with structured question data; set up analytics, privacy choice, wrapper, and `question viewed`. |
| 6 | Render collapsed, clearly labelled likely follow-up questions; track when a follow-up is opened. |
| 7 | Test empty pages, nested follow-ups, long answers, and mobile layouts. |

### Week 2 — Calm reading experience

| Day | Outcome |
| --- | --- |
| 8 | Redesign one question card with answer reveal, example, and code disclosures; track these reveal/open actions. |
| 9 | Balance typography, spacing, code blocks, lists, and long answers. |
| 10 | Add a compact `Aa` preferences menu and local text-size persistence. |
| 11 | Add Light, Dark, and Warm/Paper themes with persistence. |
| 12 | Add low-noise navigation, keyboard operation, and a calm progress indicator. |
| 13 | Accessibility pass: focus, contrast, semantic controls, and reduced motion. |
| 14 | Use the reader for a full 20-minute session; verify analytics events and dashboard data; fix the three largest distractions. |

### Week 3 — Accounts and learner identity

| Day | Outcome |
| --- | --- |
| 15 | Decide and document the authentication approach: managed auth or email/password. |
| 16 | Add users, profile, and persisted preference storage. |
| 17 | Implement registration, login, logout, protected routes, and password reset. |
| 18 | Persist reader preferences to the profile, retaining local fallback for guests. |
| 19 | Add a `My learning` entry point and a helpful new-user empty state. |
| 20 | Add auth security basics: password hashing, rate limiting, safe errors, and audit-friendly logs. |
| 21 | Test account and session flows end-to-end. |

### Week 4 — Personal plans

| Day | Outcome |
| --- | --- |
| 22 | Define the plan creator: target role, target date, availability, daily minutes, and subjects. |
| 23 | Add `personal_plans` and `plan_items` tables and API endpoints. |
| 24 | Build plan creation from published pages and question sets. |
| 25 | Implement the `Today` view with one clear next task. |
| 26 | Implement a weekly calendar or list view. |
| 27 | Implement a monthly overview from the same dated plan items. |
| 28 | Add safe rescheduling: skip, move to tomorrow, and mark complete. |

### Week 5 — Progress and retention

| Day | Outcome |
| --- | --- |
| 29 | Store learner progress server-side per plan item. |
| 30 | Add completion, confidence rating, and optional notes. |
| 31 | Build a compact dashboard: today, weekly completion, weak topics, and next item. |
| 32 | Add bookmarks and `review later`. |
| 33 | Create a review queue from low-confidence or incomplete items. |
| 34 | Evaluate streaks; add them only if they motivate rather than create pressure. |
| 35 | Test time zones, duplicate actions, interrupted sessions, and guest-to-account behavior. |

### Week 6 — Complete the admin authoring workflow

| Day | Outcome |
| --- | --- |
| 36 | Enforce draft/review/published status; expose only published content publicly. |
| 37 | Add an admin preview identical to the learner reader. |
| 38 | Complete AI draft review: generate, inspect, edit, approve, reject, and save provenance. |
| 39 | Add `Generate likely follow-ups` for a selected question. |
| 40 | Add AI suggestions for examples and optional code snippets; require admin review before saving. |
| 41 | Add duplicate detection and a content-quality checklist. |
| 42 | Add bulk tagging and filters by topic, difficulty, and status. |

### Week 7 — Quality and initial content library

| Day | Outcome |
| --- | --- |
| 43 | Create a content-writing guide: answer length, depth, examples, and follow-up style. |
| 44 | Produce one excellent pilot collection, such as Java Concurrency or Database Transactions. |
| 45 | Review the pilot collection entirely on mobile as a learner. |
| 46 | Add API/service tests for ordering, hierarchy, publishing, plans, and progress. |
| 47 | Add frontend tests for reveal, details, follow-ups, and plan completion. |
| 48 | Improve empty, loading, and error states; add useful API observability. |
| 49 | Rehearse deployment, a full off-site database backup/restore, and production monitoring. |

### Week 8 — Pilot release and iteration

| Day | Outcome |
| --- | --- |
| 50 | Invite 3–5 backend engineers or interview candidates to test it. |
| 51 | Gather feedback from one full study session per tester. |
| 52 | Fix the highest-impact reader issue. |
| 53 | Fix the highest-impact plan/progress issue. |
| 54 | Fix the highest-impact admin authoring issue. |
| 55 | Create a launch checklist and suitable privacy terms for accounts and progress data. |
| 56 | Release a focused MVP. |

## Prioritized backlog after MVP

1. Confidence-based spaced review: `I know this`, `Unsure`, `Don't know` schedules a review.
2. Search across questions, examples, tags, and personal notes.
3. Role-specific learning paths: Junior Backend, Mid-level Java, Senior Backend, System Design.
4. Content sources, last-reviewed dates, and version history.
5. Shareable read-only plans for mentors or study groups.
6. Learner and content analytics: difficult questions, bookmarks, drop-off, and completion.
7. Grounded learner AI chat that only uses approved content and links each answer to sources.

## Intentional deferrals

Do not build public AI chat first. The higher-value MVP is a trustworthy, beautiful interview-practice reader with quality content, personal plans, and durable progress. Add AI chat only after the content model, publication workflow, and learner accounts are reliable.
