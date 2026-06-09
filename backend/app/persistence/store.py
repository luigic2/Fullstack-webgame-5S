"""Repositório SQLite: partidas + log de comandos (idempotência).

Justificativa do banco (ver README): jogo single-player, baixíssimo volume
de escrita e leitura sempre por chave primária — SQLite entrega durabilidade
e idempotência com zero infraestrutura, ideal para o free tier.
"""

from __future__ import annotations

import sqlite3
import threading

from app.domain.state import GameState

from . import serial

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    seed       INTEGER NOT NULL,
    created_at REAL NOT NULL,
    state_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS commands (
    session_id    TEXT NOT NULL,
    command_id    TEXT NOT NULL,
    response_json TEXT NOT NULL,
    PRIMARY KEY (session_id, command_id)
);
"""


class Store:
    """Acesso ao SQLite, thread-safe para o threadpool do FastAPI."""

    def __init__(self, db_path: str) -> None:
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._lock = threading.Lock()
        with self._lock:
            self._conn.executescript(_SCHEMA)
            self._conn.commit()

    def create(self, state: GameState) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO sessions (session_id, seed, created_at, state_json) VALUES (?, ?, ?, ?)",
                (state.session_id, state.seed, state.created_at, serial.to_json(state)),
            )
            self._conn.commit()

    def get(self, session_id: str) -> GameState | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT state_json FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()
        if row is None:
            return None
        raw = row[0]
        assert isinstance(raw, str)
        return serial.from_json(raw)

    def persist(self, state: GameState) -> None:
        with self._lock:
            self._conn.execute(
                "UPDATE sessions SET state_json = ? WHERE session_id = ?",
                (serial.to_json(state), state.session_id),
            )
            self._conn.commit()

    def cached_command(self, session_id: str, command_id: str) -> str | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT response_json FROM commands WHERE session_id = ? AND command_id = ?",
                (session_id, command_id),
            ).fetchone()
        if row is None:
            return None
        raw = row[0]
        assert isinstance(raw, str)
        return raw

    def record_command(self, session_id: str, command_id: str, response_json: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR IGNORE INTO commands (session_id, command_id, response_json) VALUES (?, ?, ?)",
                (session_id, command_id, response_json),
            )
            self._conn.commit()
