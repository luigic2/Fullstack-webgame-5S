# eKaizen 5S — A Jornada dos Sensos

Jogo web single-player que ensina os **5 sensos do 5S pela ação** (não por quiz): o jogador transforma uma estação de trabalho caótica numa estação 5S exemplar, aplicando os cinco sensos em sequência — cada um com uma mecânica interativa distinta — guiado pelo Mentor (Mestre 5S).

> Desafio técnico eKaizen · Desenvolvedor Frontend Pleno.

## 🎮 As 5 fases (cada uma uma mecânica diferente)

| # | Senso | Mecânica |
|---|-------|----------|
| 1 | **SEIRI** · Utilização | Arrastar itens da bancada para *Manter / Etiqueta vermelha / Descartar* |
| 2 | **SEITON** · Ordenação | Encaixar cada item no contorno certo de um *shadow board* |
| 3 | **SEISO** · Limpeza | Esfregar para revelar e **etiquetar anomalias** escondidas |
| 4 | **SEIKETSU** · Padronização | Tirar *snapshot* do padrão e **detectar desvios** (acerto vs falso positivo) |
| 5 | **SHITSUKE** · Disciplina | Auditar e **sustentar** o 5S Score contra o decaimento temporal |

Transversalmente: **Radar 5S** pentagonal ao vivo (SSE), **Desafio do Mestre** periódico (classificar uma das 100 situações reais pelo senso certo) e **Hall 5S** final com veredito, badges e certificado.

## 🏗️ Arquitetura

Servidor **autoritativo**: toda regra de negócio (gabarito das 100 situações, pontuação, decaimento, plausibilidade) roda no backend. O frontend só apresenta e captura ações.

```
backend/   FastAPI · Python 3.11 · mypy strict · Pydantic v2 · SQLite
  app/domain/        lógica pura (sensos, situacoes, content, scoring, decay, plausibility, engine, state)
  app/api/ + main    DTOs, rotas, SSE, /healthz, token assinado
  app/persistence/   SQLite (store) + serialização (serial)
frontend/  React 18 · Vite · TS strict · Tailwind · Framer Motion · Zustand
  src/store          Zustand (apenas estado público)
  src/api            client HTTP + useGameStream (SSE)
  src/game           mentor, radar, dnd, phases/ (uma por senso), desafio
  src/app            telas (Start, Game, Hall, Onboarding)
```

### Fluxo autoritativo
1. `POST /api/session` → servidor gera seed (RNG determinístico), grava no SQLite e devolve **token assinado** + estado público.
2. `POST /api/commands` `{commandId, type, payload}` → valida (Pydantic) → aplica no `engine` → persiste → devolve estado público novo. **Idempotente** por `commandId`.
3. Validação de senso: o cliente envia só o `id` da situação + senso escolhido; o servidor compara com o gabarito. **A resposta correta nunca trafega ao cliente.**
4. `GET /api/stream` (SSE) empurra o estado/decaimento em tempo real — essencial na fase SHITSUKE, onde o score decai por `now - last_decay_at` (timestamp + delta, nunca `setInterval`).
5. Anti-cheat: cadência implausível → **HTTP 422**.

## 🗄️ Banco de dados

Escolhi **SQLite** como SGBD deste projeto por sua simplicidade operacional e principalmente pela velocidade de implementação, para entregar dentro do prazo. O jogo é single-player, com baixíssimo volume de escrita e leitura sempre por chave primária (sessão/comando) — SQLite entrega durabilidade e idempotência com zero infraestrutura, ideal para o free tier. Duas tabelas: `sessions` (estado serializado) e `commands` (log para idempotência).

> No free tier do Render o disco é efêmero: partidas em andamento se perdem em um redeploy. Aceitável para a demo; para produção, trocar `DB_PATH` por um volume persistente ou Postgres (a camada `persistence` isola isso).

## 🚀 Rodando localmente

**Backend** (Python 3.11+):
```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # Linux/Mac: source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload                      # http://localhost:8000
```

**Frontend** (Node 20+):
```bash
cd frontend
npm install
npm run dev                                        # http://localhost:5173
```

Por padrão o front aponta para `http://localhost:8000`. Para outra URL, defina `VITE_API_URL` (veja `frontend/.env.example`).

## ✅ Testes & CI

- Backend: `cd backend && pytest` (validador das 100 situações, máquina de estados, pontuação, decaimento, plausibilidade, idempotência).
- Frontend: `cd frontend && npm run test` (componente/mecânica de classificação).
- CI no GitHub Actions: lint + typecheck (`mypy` + `tsc`) + testes + build, em todo push/PR.

## ♿ Acessibilidade & UX

Onboarding guiado desativável, **modo daltônico** (cor + símbolo redundante por senso), navegação por teclado e foco visível, ARIA nos controles, `prefers-reduced-motion`, animações com Framer Motion (drag físico, snap, confete, radar que cresce suave).

## 📦 Deploy

- **Backend** → Render (Docker, `render.yaml`); health check em `/healthz`.
- **Frontend** → Vercel (`frontend/vercel.json`); definir `VITE_API_URL` e, no backend, `CORS_ORIGINS` com a URL da Vercel.

## 🤖 IA

Uso de IA documentado em [IA_LOG.md](IA_LOG.md).
