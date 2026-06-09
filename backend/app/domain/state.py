"""Estado autoritativo da partida (modelo interno) e sua projeção pública.

O `GameState` guarda TUDO, inclusive os gabaritos (destino correto de cada
item, anomalias escondidas, desvios injetados). A função `public_view` produz
o recorte que pode ir ao cliente — sem nenhum gabarito.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum

from .sensos import PHASE_ORDER, Senso, senso_metadata

# Patamar (0..100) que uma fase precisa atingir no radar para liberar a próxima.
PHASE_UNLOCK_THRESHOLD = 70.0
MAESTRIA_TOTAL = 90.0


class SeiriZona(StrEnum):
    """Destinos da fase SEIRI."""

    MANTER = "manter"
    RED_TAG = "red_tag"
    DESCARTAR = "descartar"


@dataclass
class SeiriItem:
    """Item da bancada na fase SEIRI. `destino` é gabarito (server-only)."""

    id: str
    nome: str
    emoji: str
    dica: str
    destino: SeiriZona
    resolvido: SeiriZona | None = None


@dataclass
class SeitonItem:
    """Item a encaixar no shadow board. `slot`/`ergonomico` são gabarito."""

    id: str
    nome: str
    emoji: str
    slot: str
    ergonomico: bool
    encaixado_em: str | None = None


@dataclass
class SeisoTile:
    """Área a limpar na fase SEISO. Pode esconder uma anomalia (gabarito)."""

    id: str
    nome: str
    emoji: str
    anomalia: str | None
    is_anomalia: bool
    limpo: bool = False
    anomalia_etiquetada: bool = False


@dataclass
class SeiketsuSpot:
    """Ponto monitorado na fase SEIKETSU. `desvio` é gabarito."""

    id: str
    nome: str
    emoji: str
    desvio: bool
    avaliado_como_desvio: bool | None = None


@dataclass
class ShitsukeItem:
    """Item de checklist de auditoria na fase SHITSUKE."""

    id: str
    senso: Senso
    texto: str
    conforme: bool = True


@dataclass
class Desafio:
    """Desafio do Mestre ativo: uma situação do banco para classificar."""

    situacao_id: int
    texto: str
    resolvido: bool = False


@dataclass
class GameState:
    """Estado interno completo de uma partida (fonte de verdade)."""

    session_id: str
    seed: int
    created_at: float
    last_decay_at: float
    current_phase: Senso = Senso.SEIRI
    finished: bool = False
    score: int = 0
    streak: int = 0
    melhor_streak: int = 0
    radar: dict[Senso, float] = field(default_factory=lambda: dict.fromkeys(PHASE_ORDER, 0.0))
    seiri: list[SeiriItem] = field(default_factory=list)
    seiton: list[SeitonItem] = field(default_factory=list)
    seiso: list[SeisoTile] = field(default_factory=list)
    seiketsu: list[SeiketsuSpot] = field(default_factory=list)
    seiketsu_snapshot: bool = False
    shitsuke: list[ShitsukeItem] = field(default_factory=list)
    desafio: Desafio | None = None
    badges: set[str] = field(default_factory=set)
    acoes: int = 0
    falsos_positivos: int = 0

    def phase_unlocked(self, senso: Senso) -> bool:
        """Uma fase está liberada se todas as anteriores passaram do patamar."""
        idx = PHASE_ORDER.index(senso)
        return all(self.radar[PHASE_ORDER[i]] >= PHASE_UNLOCK_THRESHOLD for i in range(idx))


def maturidade(score_5s: float) -> str:
    """Selo de maturidade a partir do 5S Score médio (0..100)."""
    if score_5s >= 90:
        return "Diamante"
    if score_5s >= 75:
        return "Ouro"
    if score_5s >= 55:
        return "Prata"
    return "Bronze"


def veredito(score_5s: float) -> str:
    """Título do jogador na tela final."""
    if score_5s >= 90:
        return "Mestre 5S"
    if score_5s >= 75:
        return "Auditor 5S"
    if score_5s >= 55:
        return "Praticante 5S"
    return "Aprendiz 5S"


def score_5s(state: GameState) -> float:
    """Média dos cinco eixos do radar (0..100)."""
    return sum(state.radar.values()) / len(state.radar)


def public_view(state: GameState) -> dict[str, object]:
    """Recorte do estado seguro para o cliente — SEM gabaritos."""
    media = score_5s(state)
    return {
        "sessionId": state.session_id,
        "currentPhase": int(state.current_phase),
        "finished": state.finished,
        "score": state.score,
        "streak": state.streak,
        "melhorStreak": state.melhor_streak,
        "radar": {senso.name: round(valor, 1) for senso, valor in state.radar.items()},
        "score5s": round(media, 1),
        "maturidade": maturidade(media),
        "veredito": veredito(media),
        "sensos": [senso_metadata(s) for s in PHASE_ORDER],
        "unlocked": [s.name for s in PHASE_ORDER if state.phase_unlocked(s)],
        "badges": sorted(state.badges),
        "phases": _public_phases(state),
        "desafio": _public_desafio(state),
    }


def _public_phases(state: GameState) -> dict[str, object]:
    return {
        "SEIRI": [
            {"id": i.id, "nome": i.nome, "emoji": i.emoji, "dica": i.dica, "resolvido": i.resolvido}
            for i in state.seiri
        ],
        "SEITON": [
            {
                "id": i.id,
                "nome": i.nome,
                "emoji": i.emoji,
                "slot": i.slot,
                "encaixadoEm": i.encaixado_em,
            }
            for i in state.seiton
        ],
        "SEISO": [
            {
                "id": t.id,
                "nome": t.nome,
                "emoji": t.emoji,
                "limpo": t.limpo,
                # revela a EXISTÊNCIA de anomalia só após limpar (não o gabarito antecipado)
                "is_anomalia": (t.anomalia is not None) if t.limpo else None,
                "anomalia": t.anomalia if (t.limpo and t.anomalia is not None) else None,
                "etiquetada": t.anomalia_etiquetada,
            }
            for t in state.seiso
        ],
        "SEIKETSU": {
            "snapshot": state.seiketsu_snapshot,
            "spots": [
                {
                    "id": s.id,
                    "nome": s.nome,
                    "emoji": s.emoji,
                    "avaliado": s.avaliado_como_desvio,
                }
                for s in state.seiketsu
            ],
        },
        "SHITSUKE": [
            {"id": i.id, "senso": Senso(i.senso).name, "texto": i.texto, "conforme": i.conforme}
            for i in state.shitsuke
        ],
    }


def _public_desafio(state: GameState) -> dict[str, object] | None:
    if state.desafio is None:
        return None
    return {
        "situacaoId": state.desafio.situacao_id,
        "texto": state.desafio.texto,
        "resolvido": state.desafio.resolvido,
    }
