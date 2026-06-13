# 5S Teaching Game

> An interactive educational game designed to teach Lean/Kaizen 5S methodology through hands-on simulation.  
> Built with **strict TypeScript, server-authoritative architecture, and AI-assisted development**.

**[Play it live →](https://jogo-5s.vercel.app)**

---

## 📋 About the 5S Methodology

The 5S is a foundational Lean/Kaizen system:

1. **Seiri** (Sort) — Remove unnecessary items
2. **Seiton** (Set in Order) — Organize remaining items logically
3. **Seiso** (Shine) — Clean and inspect
4. **Seiketsu** (Standardize) — Document and stabilize the process
5. **Shitsuke** (Sustain) — Make it a habit

This game lets players learn by doing: organize a messy workspace, fix inefficiencies, and watch the workspace "health" improve in real time.

---

## 🎮 How It Works

1. **Pick your language** — choose 🇧🇷 Portuguese or 🇺🇸 English on the entry screen.
2. **Enter a workspace** with 100 randomly generated scenarios (seeded by user ID).
3. **Drag items** into their correct category (tools, waste, supplies, etc.).
4. **Real-time feedback** — radar meter grows as you sort correctly; the interface guides you toward the 5S principles.
5. **Progress through phases** — one senso at a time, building muscle memory.
6. **Reset anytime** — a confirm-guarded reset returns you to phase 1 with a fresh random challenge.
7. **Reach the Hall** — a results screen rates your workspace mastery and awards badges.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast builds, modern DX |
| **Type Safety** | TypeScript (strict mode) | Correctness by construction |
| **State** | Zustand | Frequent updates, small footprint |
| **Styling** | Tailwind CSS | Rapid iteration, consistency |
| **Animation** | Framer Motion | Smooth drag-and-drop, didactic feedback |
| **Backend** | Python 3.11 + FastAPI | Type hints (`mypy --strict`), async by default |
| **Database** | SQLite | Zero-infrastructure durability, ideal for game state |
| **Real-Time** | Server-Sent Events (SSE) | One-way updates, simpler than WebSocket for this use case |
| **Deploy** | Vercel (frontend) + Render (backend) | Simple, scalable, free tier sufficient |

### Key Architectural Decisions

- **Server-Authoritative:** All game rules (scoring, decay, answer keys) live on the backend. The client is untrusted.
- **Idempotent Commands:** Every action includes a `commandId`; replaying the same action twice is safe.
- **Type-Safe Ponta a Ponta:** Backend runs `mypy --strict`, frontend runs `tsc` with `strict: true`. No `any`, no `@ts-ignore`.
- **Golden Rule:** The correct answers never leave the server. The client only gets the public game state.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Clone & Install

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
python -m venv .venv
source .venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### Run Tests

```bash
# Frontend
npm run test

# Backend
pytest
```

### Type Check & Lint

```bash
# Frontend
npm run typecheck
npm run lint

# Backend
mypy app
ruff check app tests
```

---

## 📊 Project Structure

```
jogo-didatico-5S/
├── .github/workflows/           # CI (lint, typecheck, test, build — both stacks)
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── app/                 # Screens (StartScreen, GameScreen, HallScreen, Onboarding)
│   │   ├── game/                # Game logic (mentor, radar, phases, drag-and-drop)
│   │   ├── store/               # Zustand (public state only)
│   │   ├── api/                 # HTTP client + SSE hook
│   │   ├── i18n/                # PT/EN strings + helpers
│   │   └── ui/                  # Reusable components
│   ├── vite.config.ts
│   └── tsconfig.json            # strict: true
│
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── domain/              # Pure logic (no framework)
│   │   │   ├── sensos.py        # 5S categories and validation
│   │   │   ├── situacoes.py     # Scenario answer-key validation
│   │   │   ├── content.py       # Deterministic phase/content generator (by seed)
│   │   │   ├── scoring.py       # Points & maturity rating
│   │   │   ├── decay.py         # Engagement decay over time
│   │   │   ├── plausibility.py  # Anti-cheat cadence checks
│   │   │   ├── i18n.py          # Server-side PT/EN messages
│   │   │   ├── engine.py        # Authoritative reducer
│   │   │   └── state.py         # Game state + public_view
│   │   ├── api/                 # FastAPI routes & DTOs
│   │   ├── persistence/         # SQLite & serialization
│   │   ├── seed/                # Scenario seed data
│   │   └── main.py              # App entry point
│   ├── tests/                   # pytest
│   ├── pyproject.toml
│   └── render.yaml              # Deployment blueprint
│
└── CLAUDE.md                    # Guidance for Claude Code (strict rules, stack)
```

---

## 🤖 Built with AI (and Judgment)

This project demonstrates intentional AI-assisted development: **fast execution without compromising code quality**.

**Key moments:**
- **Pre-AI:** Defined the stack, architectural constraints, and typing standards in writing (`CLAUDE.md`).
- **With AI:** Used Claude Opus for initial skeleton, Sonnet for iteration. Reviewed every change.
- **Divergences:** Chose SQLite over PostgreSQL, Zustand over Context, Framer Motion over plain CSS — each justified by scope and real-time constraints.

**Result:** Functional, tested, type-safe game delivered in ~12 hours of clock time.

👉 **[See the full IA_LOG.md](./IA_LOG.md)** for a detailed breakdown of decisions, where I pushed back on the AI's recommendations, and how we validated code quality.

---

## 📈 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Render)
- Connected to GitHub; autodeploys on push to `main`
- Uses `render.yaml` for environment and build steps
- CORS whitelist includes Vercel preview URLs

---

## 🎯 Learning Outcomes

Players leave with a mental model of the 5S:
- **Seiri (Sort):** Identify what belongs and what doesn't
- **Seiton (Set in Order):** Logical placement reduces waste
- **Seiso (Shine):** A clean workspace prevents problems
- **Seiketsu (Standardize):** Consistency prevents regression
- **Shitsuke (Sustain):** Small habits compound

The game feeds this through **visual feedback, drag-and-drop tactility, and real-time progress signals** — not lectures.

---

## 🔐 Security & Anti-Cheat

- **Server-Authoritative:** All answers on the server; brute-force attempts are impossible.
- **Cadence Check:** Rejecting implausible command sequences (e.g., 100 drags in 50ms).
- **Signed Tokens:** Session tokens are signed; tampering is detected.
- **Idempotency:** Replay attacks are harmless.

---

## 🌐 Internationalization (PT/EN)

The game ships fully bilingual — **Portuguese** (default) and **English**.

- **Pick on entry:** flag buttons (🇧🇷 / 🇺🇸) on the start screen; the choice is persisted to `localStorage`.
- **Server-authoritative content:** the language is set when the session is created and stored in `GameState`. The backend serves every scenario, mentor line, and verdict **already localized** — the same `seed` produces the same items/IDs in either language, only the text changes.
- **Japanese preserved:** the senso names (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) and their symbols are intentionally kept in Japanese in both languages.
- **Type-checked parity:** the EN string table is typed to require every key the PT table has; a runtime test also asserts `{placeholder}` consistency between languages.

---

## ♿ Accessibility

- **WCAG 2.1 AA compliant:** Color contrast, keyboard navigation, screen reader support
- **Motion:** Respects `prefers-reduced-motion`
- **Colorblind Friendly by default:** the palette **and** redundant symbols (not color alone) convey category — no toggle required. Validated with Chrome's vision-deficiency emulator (deuteranopia/protanopia).
- **Semantic HTML + ARIA:** Proper landmarks and labels

---

## 📝 License

This project was built for the **"Desafio EKaizen"** technical challenge. The source code is published for evaluation and portfolio purposes only — redistribution or reuse is not permitted without explicit authorization. See [LICENSE](./LICENSE) for the full terms.

> The confidential challenge brief (`documentacao-desafio-tecnico.pdf`) is intentionally kept out of version control via `.gitignore` and is **not** part of this repository.

---

## 👤 Author

**Luigi Cavalieri**  
Full-stack developer | TypeScript specialist | English C1

- 🔗 [LinkedIn](https://www.linkedin.com/in/lucavalieri/)
- 📧 [Email](mailto:luigi.cavalieri.dev@gmail.com)
- 🐙 [GitHub](https://github.com/luigic2)

---

## 🙏 Acknowledgments

- **EKaizen** for the challenge and methodology
- **Claude (Anthropic)** for code generation and architectural feedback
- **Open-source community** for Framer Motion, Zustand, FastAPI, and all the excellent tools powering this project
