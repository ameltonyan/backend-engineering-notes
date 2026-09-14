# Backend Engineering Notes — Public Application

## Repository Role

`backend-engineering-notes` is the public, candidate-facing React application for the Backend Engineering Interview Platform.

The other repositories are:

* `backend-engineering-notes-admin` — administration and content management
* `backend-engineering-notes-api` — Spring Boot backend API

This application is primarily a **high-quality backend engineering interview preparation and learning experience**.

It should feel like a focused reading and learning product, not an administration system or a generic CRUD application.

---

## Current Product Focus

The current priority is the **Question and Answer reading experience**.

The application should provide high-quality backend engineering interview content in a UI that is:

* extremely readable
* clean
* focused
* visually calm
* easy to scan
* comfortable for long reading sessions
* responsive
* accessible
* minimally distracting

The visual direction is inspired by the clean, focused reading experience of ChatGPT.

Do not treat "ChatGPT theme" as a requirement to copy ChatGPT's UI exactly. Use it as a design direction: clean typography, restrained visual elements, clear hierarchy, comfortable spacing, and minimal distraction.

### Reading Experience Is the Priority

When working on the question/answer page, prioritize the reading experience above adding visual features.

The user's attention should remain on:

1. the question
2. the answer
3. useful supporting information

Avoid unnecessary:

* cards
* borders
* decorative elements
* animations
* badges
* buttons
* icons
* sidebars
* popups
* visual noise
* competing calls to action

Do not add UI elements simply because there is available space.

Every element on the reading page should have a clear purpose.

---

## Content Hierarchy

Interview content follows this hierarchy:

Topic
→ Section
→ Main Question
→ Follow-up
→ Deeper Follow-up

The public application should represent this hierarchy naturally without exposing unnecessary database concepts.

The user should be able to understand where the current question belongs without the interface becoming cluttered.

---

## Question and Answer Experience

A question page should make it easy for a user to:

* understand the question quickly
* read the reference answer comfortably
* distinguish the question from the answer
* scan important parts of the explanation
* continue to related material
* explore follow-up questions when desired

The primary answer should remain the central content.

Do not overload the initial view with every possible feature.

Optional functionality should remain secondary to the main question and answer.

---

## Interview-Oriented Learning

The product is intended to prepare users for real backend engineering interviews.

Content should help users understand concepts rather than simply memorize definitions.

The experience should support different levels of depth.

For a question, users may eventually be able to access:

### Follow-up Questions

Show possible follow-up questions an interviewer could ask.

These should help the candidate understand how an interviewer might challenge or deepen their answer.

Follow-ups are related to the current question and should not feel like unrelated navigation.

### Simplified Explanation

Provide a simpler explanation of the same concept when the primary answer is difficult to understand.

This mode may use:

* simpler language
* concrete examples
* step-by-step explanation

The simplified explanation should complement the primary answer rather than replace it.

---

## Future Product Direction

The following features are part of the product roadmap.

They are **future requirements, not instructions to implement them automatically**.

Only implement them when explicitly requested.

### User Accounts and Personal Progress

Eventually users should be able to register and have their own profile and progress.

The system should eventually support per-user information such as:

* questions studied
* questions practiced
* progress
* saved notes
* personalized content
* interview preparation plans

User-specific information must remain private to that user.

Do not design frontend state in a way that assumes all users share the same personal data.

### Interview Preparation Plans

Eventually users should be able to follow weekly or monthly interview preparation plans.

A plan should expose questions from different backend engineering areas rather than repeatedly testing the same narrow topic.

The goal is to prevent preparation from becoming too predictable and to simulate the breadth of a real interview.

Potential areas may include:

* Java
* JVM
* concurrency
* Spring
* databases
* SQL
* distributed systems
* APIs
* system design
* messaging
* performance
* testing
* architecture
* debugging
* production scenarios

Do not hard-code a future curriculum structure into the frontend unless the backend contract requires it.

### AI Assistance

Eventually users should be able to ask AI questions related to the current question or answer.

The intended flow is:

Current Question / Answer
→ User asks something
→ AI generates an explanation
→ User can save the result

AI-generated personal content should belong only to the current user.

It should not become shared public content automatically.

Users should eventually be able to ask AI to rewrite or modify an answer according to their preferred learning style or wording.

This can turn the platform into a personalized interview-preparation notebook.

Examples include:

* simplify the explanation
* explain with an example
* make the answer shorter
* explain it more deeply
* rewrite it in a way that is easier to remember
* focus on interview wording

Do not assume that AI-generated user content is authoritative. It is personal learning material.

### Additional Questions

Eventually users should be able to request additional questions when the existing material is insufficient.

Generated questions should remain separate from the curated public content unless explicitly reviewed and published through the administration workflow.

### Paid Features

Some future functionality may be available only to paying users.

The frontend should be able to support feature availability based on the user's entitlement when this functionality is implemented.

Do not add fake payment or subscription behavior.

Do not hide existing functionality behind arbitrary frontend-only checks.

Access control must ultimately be enforced by the backend.

---

## Practical Coding Exercises

The platform should eventually support interactive coding and debugging exercises.

These should be treated as a distinct learning experience rather than ordinary reading questions.

Potential exercise types include:

### Code Reasoning

The user receives Java/backend code and must reason about its behavior.

Examples:

* predict the output
* identify a concurrency problem
* identify a performance problem
* explain why the code behaves incorrectly
* identify a memory problem

### Find What Is Wrong

The user receives intentionally incorrect code and must identify and fix the problems.

The UI may tell the user how many problems exist, for example:

> Find and fix 3 issues.

Do not reveal the actual issues unless the user requests a hint or the exercise design explicitly requires it.

### Debugging Exercises

The user receives a broken implementation and must locate and fix the bug.

The exercise should encourage debugging and reasoning rather than simply revealing the correct implementation.

### Refactoring Exercises

The user receives existing code and a specific refactoring requirement.

Examples:

* refactor using the Factory pattern
* refactor using the Strategy pattern
* refactor using appropriate dependency injection
* improve separation of responsibilities
* remove duplicated logic
* improve testability

The objective should be to test whether the candidate understands why a refactoring is useful, not merely whether they can reproduce a design-pattern template.

These exercise types are roadmap features. Do not implement them unless explicitly requested.

---

## UX Principles

Prefer progressive disclosure.

Show the information necessary for the current task first and allow deeper information to be accessed when the user wants it.

For example:

Question
→ Answer
→ optional Follow-ups
→ optional Simplified Explanation
→ optional AI assistance

Do not display every layer simultaneously.

The application should feel focused even as functionality grows.

### Navigation

Navigation should help users move through the curriculum without competing with the content.

Avoid permanent UI elements that consume large amounts of screen space when they are not needed.

On smaller screens, prioritize the question and answer over navigation controls.

### Responsive Design

The reading experience must work well on:

* desktop
* laptop
* tablet
* mobile

Do not simply shrink the desktop layout.

On smaller screens, remove or collapse secondary UI before reducing the readability of the main content.

### Accessibility

Maintain good:

* semantic HTML
* keyboard navigation
* focus states
* contrast
* readable typography
* button/link labeling

Do not use color alone to communicate meaning.

---

## Visual Design Rules

Prefer a restrained visual system.

Prioritize:

* typography
* spacing
* content width
* hierarchy
* readability

over decorative UI.

Long technical answers should have a comfortable reading width.

Code blocks must remain readable and usable.

Avoid excessive use of:

* rounded containers
* shadows
* gradients
* large illustrations
* animated transitions
* decorative icons

Use visual emphasis when it improves comprehension, not simply for aesthetics.

The interface should feel professional and suitable for serious interview preparation.

---

## API Integration

The backend API is in:

`backend-engineering-notes-api`

Do not invent API endpoints or response structures.

Before changing API usage:

1. inspect the existing API client/service code
2. inspect the current backend contract when available
3. understand the existing request and response models
4. make the smallest compatible frontend change

When an API change is required, clearly identify that the backend repository also needs to change.

Do not modify the backend repository unless explicitly asked.

---

## Development Rules

Before making changes:

1. Inspect the existing implementation.
2. Understand the current component and routing structure.
3. Reuse existing components and conventions where appropriate.
4. Identify the smallest reasonable change.
5. Check whether the requested functionality already partially exists.

Do not rewrite working components merely because another implementation looks cleaner.

Do not introduce unnecessary libraries.

Do not introduce a new state-management solution, UI framework, component library, or styling system without a concrete reason.

Do not redesign unrelated parts of the application while implementing a feature.

Do not modify `backend-engineering-notes-admin` or `backend-engineering-notes-api` unless explicitly requested.

---

## Product vs. Implementation

Keep product concepts separate from implementation details.

Do not expose:

* database IDs unnecessarily
* internal API terminology
* persistence details
* backend implementation details

to the user simply because they exist in the API.

The public application should present concepts in terms meaningful to an interview candidate.

---

## Current vs. Future Features

The current priority is:

**Excellent question and answer reading experience.**

Future features should not cause premature architectural or UI complexity.

When implementing a current feature, do not build speculative infrastructure for future features unless there is a clear technical requirement.

Prefer an implementation that can evolve later without unnecessarily implementing the entire roadmap today.

---

## Code Quality

Prefer:

* simple components
* clear responsibilities
* predictable state management
* reusable components where reuse is real
* explicit data flow
* maintainable styling
* readable code

Avoid:

* premature abstractions
* unnecessary generic components
* deeply nested component structures
* duplicated API logic
* global state when local state is sufficient
* abstractions created only for theoretical future requirements

Follow the existing project conventions unless there is a concrete reason to change them.

---

## Verification

After meaningful changes:

* run the relevant frontend checks
* run the build when appropriate
* verify affected pages and flows
* check responsive behavior when UI changes are involved

Do not claim that a change has been verified if it has not actually been tested.

If verification cannot be performed, state what was and was not verified.

---

## Git

Do not commit or push changes unless explicitly asked.

Do not overwrite unrelated uncommitted changes.

Before modifying files, preserve work that already exists in the working tree.

---

## Communication

For substantial changes, first briefly explain:

1. what you found
2. what you propose to change
3. why

For small and obvious changes, proceed without unnecessary discussion.

When multiple approaches are reasonable, recommend one and explain the important trade-off briefly.

If something about the existing implementation is unclear, inspect the code before guessing.

Do not invent missing backend behavior or product requirements.
