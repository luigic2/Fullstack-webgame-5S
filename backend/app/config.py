"""Configuração via variáveis de ambiente (12-factor)."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    secret_key: str
    db_path: str
    cors_origins: tuple[str, ...]


def load_settings() -> Settings:
    origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
    return Settings(
        secret_key=os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao"),
        db_path=os.environ.get("DB_PATH", "ekaizen5s.db"),
        cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
    )
