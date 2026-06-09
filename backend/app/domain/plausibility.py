"""Anti-cheat: trate o cliente como hostil.

Comandos cuja cadência é fisicamente implausível (ex.: dezenas de
classificações corretas em poucos segundos) são rejeitados. A camada HTTP
traduz `ImplausibleError` em HTTP 422.
"""

from __future__ import annotations

# Tempo mínimo plausível entre duas ações relevantes (segundos).
MIN_INTERVALO_ACAO = 0.15
# Máximo de ações numa janela curta antes de considerar automação.
MAX_ACOES_JANELA = 25
JANELA_SEGUNDOS = 5.0


class ImplausibleError(Exception):
    """Levantada quando a cadência de ações é incompatível com um humano."""


def checar_cadencia(timestamps: list[float], agora: float) -> None:
    """Valida o ritmo das ações recentes. `timestamps` já inclui `agora`."""
    if len(timestamps) >= 2 and (timestamps[-1] - timestamps[-2]) < MIN_INTERVALO_ACAO:
        raise ImplausibleError("Ações rápidas demais para serem humanas.")
    recentes = [t for t in timestamps if agora - t <= JANELA_SEGUNDOS]
    if len(recentes) > MAX_ACOES_JANELA:
        raise ImplausibleError("Volume de ações implausível na janela.")
