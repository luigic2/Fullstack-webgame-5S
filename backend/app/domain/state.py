"""Estado autoritativo da partida (modelo interno) e sua projeção pública.

O `GameState` guarda TUDO, inclusive os gabaritos (destino correto de cada
item, anomalias escondidas, desvios injetados). A função `public_view` produz
o recorte que pode ir ao cliente — sem nenhum gabarito.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum

from .decay import DURACAO_DESAFIO, META_SUSTENTACAO
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
    """Área a inspecionar na fase SEISO. `is_anomalia` é gabarito; `descricao`
    é o achado que o jogador lê para julgar (anomalia real ou algo mundano)."""

    id: str
    nome: str
    emoji: str
    descricao: str
    is_anomalia: bool
    limpo: bool = False
    decisao: str | None = None  # None | "registrar" | "ignorar"


@dataclass
class SeiketsuSpot:
    """Item da fase SEIKETSU. `posicao_correta` é a ordem do padrão; no snapshot
    ganha `posicao_atual` (embaralhada). Desvio = posições diferem (gabarito)."""

    id: str
    nome: str
    emoji: str
    posicao_correta: int
    posicao_atual: int | None = None
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
    # Desafio de sustentação da fase SHITSUKE (cronômetro + choques periódicos).
    shitsuke_iniciado: bool = False  # False até o jogador dispensar o overlay de intro
    shitsuke_last_shock_at: float = 0.0
    shitsuke_choques: int = 0
    shitsuke_sustain_since: float | None = None
    shitsuke_sustentado: bool = False
    shitsuke_restante: float = DURACAO_DESAFIO

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
        "shitsukeDesafio": {
            "ativo": state.current_phase == Senso.SHITSUKE and not state.finished and not state.shitsuke_sustentado,
            "iniciado": state.shitsuke_iniciado,
            "sustentado": state.shitsuke_sustentado,
            "metaMedia": int(META_SUSTENTACAO),
            "restanteSeg": round(state.shitsuke_restante, 1),
            "duracaoSeg": int(DURACAO_DESAFIO),
        },
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
                # o achado só aparece após inspecionar; o gabarito (is_anomalia) NUNCA vaza
                "descricao": t.descricao if t.limpo else None,
                "decisao": t.decisao,
                # acerto só é revelado depois que o jogador decide
                "acertou": ((t.decisao == "registrar") == t.is_anomalia) if t.decisao is not None else None,
            }
            for t in state.seiso
        ],
        "SEIKETSU": {
            "snapshot": state.seiketsu_snapshot,
            # ordem do padrão (a "foto"), renderizada na div de baixo após o snapshot
            "referencia": [
                {"id": s.id, "nome": s.nome, "emoji": s.emoji}
                for s in sorted(state.seiketsu, key=lambda s: s.posicao_correta)
            ],
            # ordem exibida na div de cima; antes do snapshot = referência, depois = embaralhada.
            # As posições são apresentação (o jogador compara visualmente); o gabarito não é exposto.
            "atual": [
                {
                    "id": s.id,
                    "nome": s.nome,
                    "emoji": s.emoji,
                    "avaliado": s.avaliado_como_desvio,
                    "acertou": (
                        (s.avaliado_como_desvio == (s.posicao_atual != s.posicao_correta))
                        if s.avaliado_como_desvio is not None
                        else None
                    ),
                }
                for s in sorted(
                    state.seiketsu,
                    key=lambda s: s.posicao_atual if s.posicao_atual is not None else s.posicao_correta,
                )
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
