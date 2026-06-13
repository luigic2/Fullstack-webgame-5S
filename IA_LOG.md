# IA_LOG — AI Usage in This Challenge

I built this project with **Claude Code** as the executor, but technical direction — architecture, scope, stack, and quality standards — was mine at every step. This document records, in this order: **what I decided**, **where I diverged from the AI**, **how I directed execution**, and **what I validated manually**.

## 1. Setup & Governance (Before Any Code)

I prepared the groundwork before asking the AI for code:

- Structured the repository with the relevant files and a `.gitignore` configured to **prevent the confidential challenge PDF from being committed** — information security as step one, not an afterthought.
- Wrote a **`CLAUDE.md`** locking in the rules the AI had to follow: *test-driven development*, *goal-driven execution*, **strict typing** (`mypy --strict` on the backend and TypeScript `strict` on the frontend), a defined tech stack, and code conventions. I set the rules of the game before the AI played.

## 2. Architecture — Mine, Including Against the AI's Recommendations

I asked **Claude (Opus)** to read the challenge documentation and propose an initial functional architecture (*walking skeleton*). The AI recommended **PostgreSQL + Context API + Tailwind with no animation library**. I evaluated each choice against the real constraints (single-player game, tight deadline, heavy global state, lots of on-screen motion) and **diverged on three points**:

| AI Recommendation | My Decision | Justification |
| --- | --- | --- |
| PostgreSQL | **SQLite** | Single-player, very low volume, primary-key reads only. SQLite delivers durability and idempotency with zero infrastructure overhead, which gave me implementation speed within the deadline. The `persistence` layer isolates the database engine, so switching to Postgres in production is trivial. |
| Context API | **Zustand** | The game has global state with very frequent updates (live radar via SSE, decay, drag-and-drop). Context re-renders too aggressively in this scenario; Zustand handles it more efficiently. |
| No animation library | **Framer Motion** | The goal is to teach 5S *through action*. Physical drag, snap feedback, a growing radar, and confetti are part of the pedagogy — not decoration. |

I kept **Tailwind** as recommended, since it genuinely accelerates styling. The core point: the AI proposed the "default" path; I chose the **right path for this problem**.

The design principles were also my own criteria, locked in `CLAUDE.md` and enforced during review: **server-authoritative** architecture (all business logic on the backend), the **Golden Rule** (the answer key never leaves the server), idempotency via `commandId`, and decay calculated using `timestamp + delta` server-side (never `setInterval` on the client, which would be imprecise and exploitable).

## 3. Infrastructure & Deployment — Done by Me

With the skeleton in place, I set up the infrastructure manually:

1. Created a **Render** blueprint (`render.yaml`) for the backend and deployed it.
2. Deployed the frontend to **Vercel** and configured `VITE_API_URL` pointing to the Render API.
3. Added the Vercel preview URL to the backend's CORS whitelist (`CORS_ORIGINS`), establishing the back ↔ front communication.

## 4. How I Directed the AI (The Iteration Loop)

After the skeleton, I **reviewed every change and addition the AI made to the code** before moving forward — nothing merged without passing through my eyes first.

For the iteration phase I used **Claude (Sonnet)**, which is more agile in short cycles. My loop for visual and usability bugs was deliberate and directed: for each issue I explained to the AI (1) the **intended behavior**, (2) **how it was currently behaving**, and (3) the **expected result** — rather than just saying "fix this." Directing the context and the goal, instead of delegating the diagnosis, is what kept code quality under my control.

## 5. What I Validated Manually

- *Smoke-tested* the live server (uvicorn): session creation, command submission, idempotency, and **HTTP 422** response for implausible action cadence.
- Confirmed the **Golden Rule** in real payloads and in automated tests: the public state never exposes the answer key (`sensoCorreto`).
- Reviewed test assertions (pytest + Vitest) to ensure they cover real behavior, not just that they pass.
- Ran build, lint, and typecheck locally before every commit, with **end-to-end strict typing**: `mypy --strict` on the Python backend and TypeScript `strict` mode on the frontend (`tsc`, no implicit `any`). This typing symmetry across back and front was a standard I defined — not a coincidence — and CI breaks on any violation.

## 6. Speed

Functional, polished application delivered in **~12 hours**, plus **~2 hours** of visual polish and bugfixes. The speed gain came from combining AI-assisted execution with quality criteria defined upfront (`CLAUDE.md`, TDD, CI), which cut rework — speed *with* control, not instead of it.

## 7. Tools

- **Claude Code** — Opus for architecture and initial generation; Sonnet for the iteration and adjustment loop.
- Official documentation for FastAPI, Pydantic, React, Vite, Framer Motion, and Zustand for API verification.
