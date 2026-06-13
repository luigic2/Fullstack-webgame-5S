"""Serialização do estado interno ↔ JSON para persistência durável.

Mantém o grafo de dataclasses do domínio convertível para uma linha do banco,
permitindo reidratar a partida após reinício do processo.
"""

from __future__ import annotations

import json

from app.domain.sensos import PHASE_ORDER, Lang, Senso
from app.domain.state import (
    Desafio,
    GameState,
    SeiketsuSpot,
    SeiriItem,
    SeiriZona,
    SeisoTile,
    SeitonItem,
    ShitsukeItem,
)


def to_json(state: GameState) -> str:
    payload: dict[str, object] = {
        "session_id": state.session_id,
        "seed": state.seed,
        "created_at": state.created_at,
        "last_decay_at": state.last_decay_at,
        "lang": state.lang,
        "current_phase": int(state.current_phase),
        "finished": state.finished,
        "score": state.score,
        "streak": state.streak,
        "melhor_streak": state.melhor_streak,
        "radar": {s.name: v for s, v in state.radar.items()},
        "seiri": [vars(i) | {"destino": i.destino.value, "resolvido": i.resolvido} for i in state.seiri],
        "seiton": [vars(i) for i in state.seiton],
        "seiso": [vars(t) for t in state.seiso],
        "seiketsu": [vars(s) for s in state.seiketsu],
        "seiketsu_snapshot": state.seiketsu_snapshot,
        "shitsuke": [
            {"id": i.id, "senso": int(i.senso), "texto": i.texto, "conforme": i.conforme}
            for i in state.shitsuke
        ],
        "desafio": None if state.desafio is None else vars(state.desafio),
        "badges": sorted(state.badges),
        "acoes": state.acoes,
        "falsos_positivos": state.falsos_positivos,
        "shitsuke_iniciado": state.shitsuke_iniciado,
        "shitsuke_last_shock_at": state.shitsuke_last_shock_at,
        "shitsuke_choques": state.shitsuke_choques,
        "shitsuke_sustain_since": state.shitsuke_sustain_since,
        "shitsuke_sustentado": state.shitsuke_sustentado,
        "shitsuke_restante": state.shitsuke_restante,
    }
    return json.dumps(payload)


def _str(d: dict[str, object], k: str) -> str:
    v = d[k]
    assert isinstance(v, str)
    return v


def _int(d: dict[str, object], k: str) -> int:
    v = d[k]
    assert isinstance(v, int)
    return v


def _float(d: dict[str, object], k: str) -> float:
    v = d[k]
    assert isinstance(v, (int, float))
    return float(v)


def _bool(d: dict[str, object], k: str) -> bool:
    v = d[k]
    assert isinstance(v, bool)
    return v


def _list(d: dict[str, object], k: str) -> list[dict[str, object]]:
    v = d[k]
    assert isinstance(v, list)
    return [item for item in v if isinstance(item, dict)]


def from_json(raw: str) -> GameState:
    d = json.loads(raw)
    assert isinstance(d, dict)
    radar_raw = d["radar"]
    assert isinstance(radar_raw, dict)
    radar = {s: float(radar_raw[s.name]) for s in PHASE_ORDER}
    desafio_raw = d.get("desafio")
    desafio = None
    if isinstance(desafio_raw, dict):
        desafio = Desafio(
            situacao_id=_int(desafio_raw, "situacao_id"),
            texto=_str(desafio_raw, "texto"),
            resolvido=_bool(desafio_raw, "resolvido"),
        )
    badges_raw = d["badges"]
    assert isinstance(badges_raw, list)
    lang: Lang = "en" if d.get("lang") == "en" else "pt"
    return GameState(
        session_id=_str(d, "session_id"),
        seed=_int(d, "seed"),
        created_at=_float(d, "created_at"),
        last_decay_at=_float(d, "last_decay_at"),
        lang=lang,
        current_phase=Senso(_int(d, "current_phase")),
        finished=_bool(d, "finished"),
        score=_int(d, "score"),
        streak=_int(d, "streak"),
        melhor_streak=_int(d, "melhor_streak"),
        radar=radar,
        seiri=[
            SeiriItem(
                id=_str(i, "id"), nome=_str(i, "nome"), emoji=_str(i, "emoji"), dica=_str(i, "dica"),
                destino=SeiriZona(_str(i, "destino")),
                resolvido=None if i.get("resolvido") is None else SeiriZona(_str(i, "resolvido")),
            )
            for i in _list(d, "seiri")
        ],
        seiton=[
            SeitonItem(
                id=_str(i, "id"), nome=_str(i, "nome"), emoji=_str(i, "emoji"), slot=_str(i, "slot"),
                ergonomico=_bool(i, "ergonomico"),
                encaixado_em=None if i.get("encaixado_em") is None else _str(i, "encaixado_em"),
            )
            for i in _list(d, "seiton")
        ],
        seiso=[
            SeisoTile(
                id=_str(t, "id"), nome=_str(t, "nome"), emoji=_str(t, "emoji"),
                descricao=_str(t, "descricao"),
                is_anomalia=_bool(t, "is_anomalia"), limpo=_bool(t, "limpo"),
                decisao=None if t.get("decisao") is None else _str(t, "decisao"),
            )
            for t in _list(d, "seiso")
        ],
        seiketsu=[
            SeiketsuSpot(
                id=_str(s, "id"), nome=_str(s, "nome"), emoji=_str(s, "emoji"),
                posicao_correta=_int(s, "posicao_correta"),
                posicao_atual=None if s.get("posicao_atual") is None else _int(s, "posicao_atual"),
                avaliado_como_desvio=(
                    None if s.get("avaliado_como_desvio") is None else _bool(s, "avaliado_como_desvio")
                ),
            )
            for s in _list(d, "seiketsu")
        ],
        seiketsu_snapshot=_bool(d, "seiketsu_snapshot"),
        shitsuke=[
            ShitsukeItem(
                id=_str(i, "id"), senso=Senso(_int(i, "senso")),
                texto=_str(i, "texto"), conforme=_bool(i, "conforme"),
            )
            for i in _list(d, "shitsuke")
        ],
        desafio=desafio,
        badges={b for b in badges_raw if isinstance(b, str)},
        acoes=_int(d, "acoes"),
        falsos_positivos=_int(d, "falsos_positivos"),
        shitsuke_iniciado=bool(d.get("shitsuke_iniciado", False)),
        shitsuke_last_shock_at=_float(d, "shitsuke_last_shock_at"),
        shitsuke_choques=_int(d, "shitsuke_choques"),
        shitsuke_sustain_since=(
            None if d.get("shitsuke_sustain_since") is None else _float(d, "shitsuke_sustain_since")
        ),
        shitsuke_sustentado=_bool(d, "shitsuke_sustentado"),
        shitsuke_restante=_float(d, "shitsuke_restante"),
    )
