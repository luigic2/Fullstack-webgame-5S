"""Aplicação FastAPI — fronteira HTTP/SSE do servidor autoritativo.

Responsabilidades: criar sessão (token assinado), aplicar comandos de forma
idempotente, validar plausibilidade e empurrar o estado público via SSE.
Nenhuma regra de domínio vive aqui — tudo delega a `app.domain.engine`.
"""

from __future__ import annotations

import asyncio
import json
import secrets
import time
from collections import defaultdict
from collections.abc import AsyncIterator

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from itsdangerous import BadSignature, URLSafeSerializer

from .api.dtos import (
    CommandFeedback,
    CommandRequest,
    CommandResponse,
    NewGameResponse,
)
from .api.hub import GameHub
from .config import Settings, load_settings
from .domain import engine
from .domain.plausibility import ImplausibleError, checar_cadencia
from .domain.state import public_view
from .persistence.store import Store

settings: Settings = load_settings()
_serializer = URLSafeSerializer(settings.secret_key, salt="ekaizen5s-session")
store = Store(settings.db_path)
hub = GameHub()
_cadencia: dict[str, list[float]] = defaultdict(list)

app = FastAPI(title="eKaizen 5S — Servidor Autoritativo", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _make_token(session_id: str) -> str:
    return _serializer.dumps(session_id)


def _read_token(token: str) -> str:
    try:
        sid = _serializer.loads(token)
    except BadSignature as exc:
        raise HTTPException(status_code=401, detail="token inválido") from exc
    if not isinstance(sid, str):
        raise HTTPException(status_code=401, detail="token inválido")
    return sid


def require_session(x_session_token: str = Header(...)) -> str:
    return _read_token(x_session_token)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/session", response_model=NewGameResponse)
def new_session() -> NewGameResponse:
    session_id = secrets.token_urlsafe(12)
    seed = secrets.randbelow(1_000_000)
    state = engine.new_game(session_id, seed, now=time.time())
    store.create(state)
    return NewGameResponse(token=_make_token(session_id), state=public_view(state))


@app.post("/api/commands", response_model=CommandResponse)
async def post_command(
    req: CommandRequest, session_id: str = Depends(require_session)
) -> CommandResponse:
    cached = store.cached_command(session_id, req.command_id)
    if cached is not None:
        return CommandResponse.model_validate_json(cached)

    state = store.get(session_id)
    if state is None:
        raise HTTPException(status_code=404, detail="sessão não encontrada")

    now = time.time()
    marcas = _cadencia[session_id]
    marcas.append(now)
    del marcas[:-50]
    try:
        checar_cadencia(marcas, now)
        outcome = engine.apply(state, req.type, req.payload, now)
    except ImplausibleError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except engine.UnknownCommand as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    store.persist(state)
    response = CommandResponse(
        feedback=CommandFeedback(
            correto=outcome.correto, mentor=outcome.mentor, mensagem=outcome.mensagem
        ),
        state=public_view(state),
    )
    store.record_command(session_id, req.command_id, response.model_dump_json())
    await hub.publish(session_id, json.dumps(response.state))
    return response


@app.get("/api/stream")
async def stream(token: str = Query(...)) -> StreamingResponse:
    session_id = _read_token(token)
    if store.get(session_id) is None:
        raise HTTPException(status_code=404, detail="sessão não encontrada")
    queue = await hub.subscribe(session_id)

    async def gen() -> AsyncIterator[str]:
        try:
            estado = store.get(session_id)
            if estado is not None:
                yield _sse(json.dumps(public_view(estado)))
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=3.0)
                    yield _sse(payload)
                except TimeoutError:
                    estado = store.get(session_id)
                    if estado is not None and engine.tick_decay(estado, time.time()):
                        store.persist(estado)
                        yield _sse(json.dumps(public_view(estado)))
                    else:
                        yield ": keep-alive\n\n"
        finally:
            await hub.unsubscribe(session_id, queue)

    return StreamingResponse(gen(), media_type="text/event-stream")


def _sse(data: str) -> str:
    return f"data: {data}\n\n"
