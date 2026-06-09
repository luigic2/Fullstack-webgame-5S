"""Pontuação — calculada exclusivamente no servidor.

Acerto na 1ª tentativa vale mais; erro reduz e ensina. Streak dá bônus de
fluência (sem premiar chute, pois errar zera o streak).
"""

from __future__ import annotations

PONTOS_ACERTO = 100
PONTOS_ERRO = -20
PONTOS_ANOMALIA = 60
PONTOS_DECISAO = 60  # julgamento correto conforme/desvio (SEIKETSU); errado vale 0
PONTOS_FALSO_POSITIVO = -40
BONUS_STREAK_MAX = 50


def pontos_classificacao(correto: bool, streak_atual: int) -> int:
    """Pontos por classificar uma situação/item (SEIRI, Desafio, auditoria)."""
    if not correto:
        return PONTOS_ERRO
    bonus = min(streak_atual * 10, BONUS_STREAK_MAX)
    return PONTOS_ACERTO + bonus


def pontos_deteccao(acertou_desvio: bool, era_desvio: bool) -> int:
    """Pontos por detectar desvio (SEIKETSU): acerto vs falso positivo."""
    if era_desvio and acertou_desvio:
        return PONTOS_ACERTO
    if not era_desvio and acertou_desvio:
        return PONTOS_FALSO_POSITIVO
    return 0


def pontos_anomalia(etiquetou_real: bool) -> int:
    """Pontos por etiquetar uma anomalia revelada (SEISO)."""
    return PONTOS_ANOMALIA if etiquetou_real else PONTOS_FALSO_POSITIVO
