"""Decaimento temporal do 5S Score (fase SHITSUKE).

A entropia corrói o radar com o tempo REAL decorrido — baseado em
`now - last_decay_at`, nunca em `setInterval` ingênuo. Se o jogador minimiza
a aba e volta depois, o estado reflete o tempo decorrido de forma coerente.
"""

from __future__ import annotations

from .sensos import PHASE_ORDER, Senso

# Pontos de radar perdidos por segundo de abandono, por eixo.
DECAY_POR_SEGUNDO = 0.6
DECAY_MAX_SEGUNDOS = 120.0


def aplicar_decay(
    radar: dict[Senso, float],
    last_decay_at: float,
    now: float,
    ativo: bool,
) -> tuple[dict[Senso, float], float]:
    """Retorna (radar_decaído, novo_last_decay_at).

    `ativo` indica se a fase de sustentação está rolando (só então decai).
    O delta é limitado para não zerar tudo após uma ausência muito longa.
    """
    if not ativo or now <= last_decay_at:
        return radar, now
    delta = min(now - last_decay_at, DECAY_MAX_SEGUNDOS)
    perda = delta * DECAY_POR_SEGUNDO
    novo = {senso: max(0.0, radar[senso] - perda) for senso in PHASE_ORDER}
    return novo, now
