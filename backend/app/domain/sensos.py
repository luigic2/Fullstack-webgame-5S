"""Os cinco sensos do 5S.

Cada senso tem um id estável (1..5), a chave japonesa, a tradução em PT e a
ação-resumo. Esses metadados são públicos (podem ir ao cliente); o que nunca
vai ao cliente é o gabarito que liga uma *situação* ao seu senso correto.
"""

from __future__ import annotations

from enum import IntEnum


class Senso(IntEnum):
    """Os 5 sensos, na ordem canônica de aplicação."""

    SEIRI = 1
    SEITON = 2
    SEISO = 3
    SEIKETSU = 4
    SHITSUKE = 5


SENSO_PT: dict[Senso, str] = {
    Senso.SEIRI: "Utilização",
    Senso.SEITON: "Ordenação",
    Senso.SEISO: "Limpeza",
    Senso.SEIKETSU: "Padronização",
    Senso.SHITSUKE: "Disciplina",
}

SENSO_ACAO: dict[Senso, str] = {
    Senso.SEIRI: "Separar o necessário do desnecessário",
    Senso.SEITON: "Um lugar para cada coisa; identificar e ordenar",
    Senso.SEISO: "Limpar e, ao limpar, inspecionar",
    Senso.SEIKETSU: "Criar e manter padrões visuais e de saúde",
    Senso.SHITSUKE: "Transformar em hábito; auditar e sustentar",
}

# Ordem de progressão das fases. A fase N só libera quando N-1 atinge o
# patamar mínimo: não se ordena o que ainda não foi separado.
PHASE_ORDER: tuple[Senso, ...] = (
    Senso.SEIRI,
    Senso.SEITON,
    Senso.SEISO,
    Senso.SEIKETSU,
    Senso.SHITSUKE,
)


def senso_metadata(senso: Senso) -> dict[str, str | int]:
    """Metadados públicos de um senso (sem qualquer gabarito)."""
    return {
        "id": int(senso),
        "key": senso.name,
        "pt": SENSO_PT[senso],
        "acao": SENSO_ACAO[senso],
    }
