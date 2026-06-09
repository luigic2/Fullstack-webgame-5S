# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational game ("Jogo didático 5S") designed to teach the 5S Lean/Kaizen methodology in a fun and interactive way. The project is part of the "Desafio EKaizen" initiative.

The 5S methodology covers: Seiri (Sort), Seiton (Set in Order), Seiso (Shine), Seiketsu (Standardize), Shitsuke (Sustain).

## 🚀 Project Overview
- **Tech Stack:** React 18+, Vite, TypeScript, Tailwind CSS, Python 3.11, FastAPI, WS/SSE, SQLite
- **Framework:** React 18+

## 12-Rule Template

These rules apply to every task in this project. Use them as an iterative loop rather than strict sequential steps.

## Phase 1: Planning
### Rule 1 — Think Before Coding
State assumptions explicitly. Ask rather than guess. Push back when a simpler approach exists. Stop when you are confused.

### Rule 2 — Simplicity First
Write the minimum code that solves the problem. Do nothing speculative. Do not build abstractions for single-use code.

### Rule 3 — Surgical Changes
Touch only what you must. Do not improve adjacent code. Match the existing style exactly. Do not refactor what isn't broken.

## Phase 2: Execution
### Rule 4 — Goal-Driven Execution
Define success criteria upfront. Loop until verified. Strong success criteria let the agent loop independently.

### Rule 5 — Judgment Over Guesswork
Use the model primarily for judgment calls (classification, summarization, extraction). If existing code or libraries can answer the question, do not invent custom logic.

### Rule 6 — Token Budget Discipline
Token budgets are strict boundaries. If a complex task approaches limits, summarize progress and ask for permission to start a fresh context rather than silently overflowing.

### Rule 7 — Conflict Resolution
If two patterns contradict, pick one (e.g., the more recent or tested) and explain why. Surface the conflict instead of averaging them out.

### Rule 8 — Read Before You Write
Before adding code, read the module exports, immediate callers, and shared utilities to prevent duplicating efforts or breaking imports.

## Phase 3: Testing & Reporting
### Rule 9 — Trust, But Verify
Write strong assertions. Just because a function returns without error does not mean it works correctly. Ensure side-effects and critical paths are explicitly tested.

### Rule 10 — Step-by-Step Recovery
When a multi-step refactor fails midway, halt. Do not complete steps 5 and 6 on top of a broken state from step 4. Report the failure immediately.

### Rule 11 — Native Style Adherence
Respect language idioms. Do not introduce patterns from one ecosystem into another (e.g., no React hooks in standard JS class components). 

### Rule 12 — Fail Loudly
"Completed" is unacceptable if anything was skipped silently. "Tests pass" is invalid if any were skipped. Default to surfacing uncertainty and skipped constraints, never hide them.

## Hard constraints (do not violate)

- **Regra de Ouro:** o gabarito das 100 situações (`sensoCorreto`), a pontuação e o decaimento vivem **só no backend**. Nenhuma regra de negócio no cliente — o front apenas apresenta e captura ações. Qualquer dado vindo do cliente é tratado como hostil.
- **TypeScript:** `strict: true`. Proibido `any`, `as any`, `@ts-ignore`. Componentes React **< 200 linhas**.
- **Python:** `mypy --strict` sem erros; validação Pydantic v2 em toda fronteira HTTP. Evite `# type: ignore` no domínio.
- Toda mutação aceita um `commandId` e é **idempotente**. O decaimento usa `now - last_decay_at` (timestamp+delta), nunca `setInterval`.

## Estrutura

- `backend/app/domain/` — lógica pura (sem FastAPI): `sensos`, `situacoes` (valida senso server-side), `content` (gera fases por seed), `scoring`, `decay`, `plausibility`, `engine` (reducer autoritativo), `state` (estado interno + `public_view` sem gabarito).
- `backend/app/api/` + `main.py` — DTOs, rotas (`/api/session`, `/api/commands`, `/api/stream` SSE, `/healthz`) e tokens assinados.
- `backend/app/persistence/` — SQLite (`store`) + serialização (`serial`).
- `frontend/src/` — `store/` (Zustand, só estado público), `api/` (client HTTP + `useGameStream` SSE), `game/` (mentor, radar, dnd, `phases/` uma por senso, desafio), `app/` (telas), `ui/`.

## Commands

Backend (em `backend/`, venv em `.venv`):
- Instalar: `pip install -e ".[dev]"`
- Rodar: `uvicorn app.main:app --reload`
- Testes: `pytest` · um teste: `pytest tests/test_domain.py::test_validador_senso_bate_com_gabarito_das_100`
- Typecheck: `mypy app` · Lint: `ruff check app tests`

Frontend (em `frontend/`):
- Instalar: `npm install` · Rodar: `npm run dev`
- Testes: `npm run test` · um arquivo: `npm run test -- SeiriPhase`
- Typecheck: `npm run typecheck` · Lint: `npm run lint` · Build: `npm run build`
