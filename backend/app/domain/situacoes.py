"""Banco das 100 situações reais + validação de senso (server-side).

REGRA DE OURO: o gabarito (`senso_correto`) nunca trafega para o cliente.
O cliente recebe apenas `id` + `texto` de uma situação; quem decide se o
senso escolhido está certo é este módulo, no servidor.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field

from .sensos import Senso

_SEED_PATH = Path(__file__).resolve().parent.parent / "seed" / "situacoes-5s-gabarito.json"


class Situacao(BaseModel):
    """Uma situação de chão de fábrica com seu senso correto (gabarito)."""

    id: int
    situacao: str
    senso_correto: int = Field(alias="sensoCorreto")
    senso: str


class _Seed(BaseModel):
    banco: list[Situacao]


@lru_cache(maxsize=1)
def _load() -> dict[int, Situacao]:
    raw: str = _SEED_PATH.read_text(encoding="utf-8")
    seed = _Seed.model_validate(json.loads(raw))
    return {s.id: s for s in seed.banco}


def all_ids() -> list[int]:
    """Todos os ids do banco, ordenados (uso interno/seed de partida)."""
    return sorted(_load().keys())


def texto(situacao_id: int) -> str:
    """Texto público de uma situação. Levanta KeyError se id inexistente."""
    return _load()[situacao_id].situacao


def senso_correto(situacao_id: int) -> Senso:
    """Gabarito de uma situação — NUNCA exponha o retorno ao cliente."""
    return Senso(_load()[situacao_id].senso_correto)


def is_correct(situacao_id: int, escolha: Senso) -> bool:
    """Valida, no servidor, se `escolha` resolve a situação."""
    return senso_correto(situacao_id) == escolha


def ids_por_senso(senso: Senso) -> list[int]:
    """Ids cujo gabarito é `senso` (uso interno para gerar conteúdo)."""
    return sorted(sid for sid, s in _load().items() if s.senso_correto == int(senso))
