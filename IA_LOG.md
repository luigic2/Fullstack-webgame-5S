# IA_LOG — uso de IA neste desafio

Usei o **Claude Code** (Anthropic) como copiloto de ponta a ponta, com a minha condução e critério em todas as decisões de arquitetura, jogabilidade e UX.

## Como a IA foi usada

- **Leitura do desafio e arquitetura:** a IA leu o PDF e o seed das 100 situações e ajudou a desenhar a arquitetura (servidor autoritativo, domínio puro separado da fronteira HTTP, SSE para tempo real, idempotência por `commandId`). As decisões de stack/escopo foram minhas, validadas em conjunto.
- **Estratégia de escopo:** dado o prazo curto, optei por *walking skeleton* primeiro (uma fase ponta-a-ponta + testes + CI + deploy) e depois empilhar as demais fases. A IA executou seguindo essa prioridade.
- **Backend:** geração dos módulos de domínio (`engine`, `scoring`, `decay`, `plausibility`, `situacoes`), DTOs Pydantic, SQLite e SSE, mantendo `mypy --strict` e `ruff` verdes.
- **Frontend:** componentes React (< 200 linhas cada), store Zustand, drag-and-drop com Framer Motion, Radar pentagonal animado, Mentor expressivo, acessibilidade (modo daltônico, ARIA, teclado).
- **Testes:** a IA escreveu os testes (pytest + Vitest); revisei as asserções para garantir que cobrem o comportamento real (validador das 100 situações, idempotência, plausibilidade, gating de fases).

## O que validei manualmente

- Smoke test do servidor real (uvicorn): sessão, comando, idempotência e 422.
- Confirmei a **Regra de Ouro**: o estado público não expõe `sensoCorreto`/gabarito (verificado em teste automatizado e no payload real).
- Conferi build, lint e typecheck de back e front localmente antes de commitar.

## Ferramentas

- Claude Code (modelo Claude Opus/Sonnet) para geração e refatoração de código.
- Documentação oficial de FastAPI, Pydantic, React, Vite, Framer Motion e Zustand para conferência de APIs.
