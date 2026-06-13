# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational game ("5S Teaching Game") designed to teach the 5S Lean/Kaizen methodology in a fun and interactive way. The project is part of the "EKaizen Challenge" initiative.

The 5S methodology covers: Seiri (Sort), Seiton (Set in Order), Seiso (Shine), Seiketsu (Standardize), Shitsuke (Sustain).

## 🚀 Tech Stack
- **Frontend:** React 18+, Vite, TypeScript (strict mode), Tailwind CSS, Framer Motion, Zustand
- **Backend:** Python 3.11, FastAPI, WebSocket/SSE, SQLite
- **Deployment:** Vercel (frontend), Render (backend)

## 12-Rule Template

These rules apply to every task in this project. Use them as an iterative loop rather than strict sequential steps.

### Phase 1: Planning

**Rule 1 — Think Before Coding**
State assumptions explicitly. Ask rather than guess. Push back when a simpler approach exists. Stop when you are confused.

**Rule 2 — Simplicity First**
Write the minimum code that solves the problem. Do nothing speculative. Do not build abstractions for single-use code.

**Rule 3 — Surgical Changes**
Touch only what you must. Do not improve adjacent code. Match the existing style exactly. Do not refactor what isn't broken.

### Phase 2: Execution

**Rule 4 — Goal-Driven Execution**
Define success criteria upfront. Loop until verified. Strong success criteria let the agent loop independently.

**Rule 5 — Judgment Over Guesswork**
Use the model primarily for judgment calls (classification, summarization, extraction). If existing code or libraries can answer the question, do not invent custom logic.

**Rule 6 — Token Budget Discipline**
Token budgets are strict boundaries. If a complex task approaches limits, summarize progress and ask for permission to start a fresh context rather than silently overflowing.

**Rule 7 — Conflict Resolution**
If two patterns contradict, pick one (e.g., the more recent or tested) and explain why. Surface the conflict instead of averaging them out.

**Rule 8 — Read Before You Write**
Before adding code, read the module exports, immediate callers, and shared utilities to prevent duplicating efforts or breaking imports.

### Phase 3: Testing & Reporting

**Rule 9 — Trust, But Verify**
Write strong assertions. Just because a function returns without error does not mean it works correctly. Ensure side-effects and critical paths are explicitly tested.

**Rule 10 — Step-by-Step Recovery**
When a multi-step refactor fails midway, halt. Do not complete steps 5 and 6 on top of a broken state from step 4. Report the failure immediately.

**Rule 11 — Native Style Adherence**
Respect language idioms. Do not introduce patterns from one ecosystem into another (e.g., no React hooks in standard JS class components).

**Rule 12 — Fail Loudly**
"Completed" is unacceptable if anything was skipped silently. "Tests pass" is invalid if any were skipped. Default to surfacing uncertainty and skipped constraints, never hide them.

## Hard Constraints (Do Not Violate)

- **Golden Rule:** The answer key (`sensoCorreto`), scoring, and decay live **in the backend only**. No business logic on the client — the frontend only presents and captures actions. Any data from the client is treated as hostile.
- **TypeScript:** `strict: true` in `tsconfig.json`. Forbidden: `any`, `as any`, `@ts-ignore`. React components **< 200 lines**.
- **Python:** `mypy --strict` with zero errors; Pydantic v2 validation at every HTTP boundary. Avoid `# type: ignore` in domain logic.
- Every mutation accepts a `commandId` and is **idempotent**. Decay uses `now - last_decay_at` (timestamp + delta), never `setInterval`.

## Project Structure

- `backend/app/domain/` — Pure logic (no FastAPI): `sensos`, `situacoes` (validates senso server-side), `content` (generates phases by seed), `scoring`, `decay`, `plausibility`, `i18n` (server-side PT/EN messages), `engine` (authoritative reducer), `state` (internal state + `public_view` without answers).
- `backend/app/api/` + `main.py` — DTOs, routes (`/api/session`, `/api/commands`, `/api/stream` SSE, `/healthz`), and signed tokens.
- `backend/app/persistence/` — SQLite (`store`) + serialization (`serial`).
- `frontend/src/` — `store/` (Zustand, public state only), `api/` (HTTP client + `useGameStream` SSE), `game/` (mentor, radar, dnd, `phases/` one per senso, challenges), `app/` (screens), `ui/`.

## Commands

**Backend** (in `backend/`, venv at `.venv`):
```bash
pip install -e ".[dev]"              # Install dependencies
uvicorn app.main:app --reload         # Run development server
pytest                                # Run all tests
pytest tests/test_domain.py::test_validador_senso_bate_com_gabarito_das_100  # Single test
mypy app                              # Type check
ruff check app tests                  # Lint
```

**Frontend** (in `frontend/`):
```bash
npm install                           # Install dependencies
npm run dev                           # Run development server
npm run test                          # Run tests
npm run test -- SeiriPhase            # Test single file
npm run typecheck                     # Type check
npm run lint                          # Lint
npm run build                         # Build for production
```

## Typing

Strict typing is mandatory and non-negotiable throughout all generated code.

### Backend (Python)
- `mypy --strict` must pass cleanly. No `# type: ignore` without a comment justifying it.
- No implicit or explicit `Any`, except at genuinely dynamic boundaries (isolate and document if necessary).
- Data models and DTOs via Pydantic v2 — validation and types at the HTTP boundary, never loose `dict` flowing through the domain.
- Public domain functions always have complete type signatures (parameters and return type).

### Frontend (TypeScript)
- `tsconfig` with `strict: true` (includes `noImplicitAny`, `strictNullChecks`, etc.). `tsc` must pass cleanly.
- Forbidden: `any`. Use `unknown` + type narrowing when the type is uncertain. `as` (type assertion) only with justification.
- Type the API contract (request/response) and store state (Zustand) explicitly — no loose inference on data crossing the network↔client boundary.

### Cross-Cutting Rule
Typing is the first contract of correctness: code should be correct *by construction* before relying on tests. If a type allows an invalid state, the type is wrong — fix the type, do not add a runtime check.

## Key Design Principles

1. **Server-Authoritative:** All rules of the game live on the server. The client is untrusted.
2. **Test-Driven:** Write tests first, then implementation. Strong test coverage validates behavior, not just assertions.
3. **Idempotent Commands:** Every action is safe to replay. Use `commandId` to detect and reject duplicates.
4. **Performance:** Real-time updates via SSE. Animations enhance learning, not distract from it.
5. **Accessibility:** WCAG 2.1 AA. Keyboard navigation, color contrast, screen reader support, respects `prefers-reduced-motion`.
