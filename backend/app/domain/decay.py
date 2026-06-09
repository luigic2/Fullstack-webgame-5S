"""Decaimento temporal do 5S Score (fase SHITSUKE).

A entropia corrói o radar com o tempo REAL decorrido — baseado em
`now - last_decay_at`, nunca em `setInterval` ingênuo. Se o jogador minimiza
a aba e volta depois, o estado reflete o tempo decorrido de forma coerente.
"""

from __future__ import annotations

import random

from .sensos import PHASE_ORDER, Senso

# Pontos de radar perdidos por segundo de abandono, por eixo.
DECAY_POR_SEGUNDO = 0.6
DECAY_MAX_SEGUNDOS = 120.0

# Desafio de sustentação (SHITSUKE): choques periódicos + meta cronometrada.
INTERVALO_CHOQUE = 5.0   # a cada 5s, 2 setores levam um choque
FATOR_CHOQUE = 0.8       # -20% multiplicativo no setor atingido
META_SUSTENTACAO = 50.0  # média (score5s) mínima exigida
DURACAO_DESAFIO = 30.0   # segundos contínuos ≥ meta para concluir


def setores_do_choque(seed: int, indice: int) -> tuple[Senso, Senso]:
    """Os 2 setores atingidos no choque `indice` (determinístico por seed)."""
    rng = random.Random(seed * 7919 + indice)
    a, b = rng.sample(list(PHASE_ORDER), 2)
    return a, b


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
