"""Reducer autoritativo: cria a partida e aplica comandos ao estado.

Toda regra de negócio (validação de senso, pontuação, avanço de fase,
decaimento) vive aqui. A camada HTTP só traduz DTOs ↔ comandos e serializa
a `public_view`. Nenhum gabarito sai deste módulo.
"""

from __future__ import annotations

from dataclasses import dataclass

from . import content, scoring, situacoes
from .decay import aplicar_decay
from .sensos import PHASE_ORDER, Senso
from .state import (
    GameState,
    SeiketsuSpot,
    SeiriZona,
    SeisoTile,
    score_5s,
)

ACOES_POR_DESAFIO = 4
BUMP_SUSTENTACAO = 8.0


@dataclass
class CommandOutcome:
    """Feedback de um comando para o Mentor reagir no cliente."""

    correto: bool | None
    mentor: str  # "pergunta" | "boasvindas" | "comemora" | "aprova"
    mensagem: str


class UnknownCommand(Exception):
    """Tipo de comando não reconhecido."""


def new_game(session_id: str, seed: int, now: float) -> GameState:
    state = GameState(
        session_id=session_id,
        seed=seed,
        created_at=now,
        last_decay_at=now,
        seiri=content.gen_seiri(seed),
        seiton=content.gen_seiton(seed),
        seiso=content.gen_seiso(seed),
        seiketsu=content.gen_seiketsu(seed),
        shitsuke=content.gen_shitsuke(seed),
    )
    return state


def _s(payload: dict[str, object], key: str) -> str:
    valor = payload.get(key)
    if not isinstance(valor, str):
        raise UnknownCommand(f"campo '{key}' inválido")
    return valor


def _b(payload: dict[str, object], key: str) -> bool:
    valor = payload.get(key)
    if not isinstance(valor, bool):
        raise UnknownCommand(f"campo '{key}' inválido")
    return valor


def _i(payload: dict[str, object], key: str) -> int:
    valor = payload.get(key)
    if not isinstance(valor, int) or isinstance(valor, bool):
        raise UnknownCommand(f"campo '{key}' inválido")
    return valor


def _set_radar(state: GameState, senso: Senso, corretos: int, total: int) -> None:
    state.radar[senso] = (corretos / total * 100.0) if total else 0.0


def _registrar(state: GameState, correto: bool) -> None:
    state.acoes += 1
    if correto:
        state.streak += 1
        state.melhor_streak = max(state.melhor_streak, state.streak)
    else:
        state.streak = 0


def apply(state: GameState, ctype: str, payload: dict[str, object], now: float) -> CommandOutcome:
    """Aplica um comando ao estado (mutação) e devolve o feedback do Mentor."""
    if ctype == "seiri.classificar":
        return _seiri(state, payload)
    if ctype == "seiton.encaixar":
        return _seiton(state, payload)
    if ctype == "seiso.limpar":
        return _seiso_limpar(state, payload)
    if ctype == "seiso.decidir":
        return _seiso_decidir(state, payload)
    if ctype == "seiketsu.snapshot":
        return _seiketsu_snapshot(state)
    if ctype == "seiketsu.avaliar":
        return _seiketsu(state, payload)
    if ctype == "shitsuke.corrigir":
        return _shitsuke(state, payload, now)
    if ctype == "shitsuke.tick":
        _decay(state, now)
        return CommandOutcome(None, "pergunta", "A entropia avança — sustente o padrão!")
    if ctype == "desafio.classificar":
        return _desafio(state, payload)
    if ctype == "fase.avancar":
        return _avancar(state, now)
    raise UnknownCommand(ctype)


def _seiri(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    item = next(i for i in state.seiri if i.id == _s(payload, "itemId"))
    zona = SeiriZona(_s(payload, "zona"))
    correto = zona == item.destino
    item.resolvido = zona
    _set_radar(state, Senso.SEIRI, sum(i.resolvido == i.destino for i in state.seiri), len(state.seiri))
    state.score += scoring.pontos_classificacao(correto, state.streak)
    _registrar(state, correto)
    _talvez_desafio(state)
    if correto:
        return CommandOutcome(True, "comemora", f"Isso! {item.nome} no lugar certo.")
    return CommandOutcome(False, "boasvindas", "Quase. Item raro ou pouco usado vai pra etiqueta vermelha.")


def _seiton(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    item = next(i for i in state.seiton if i.id == _s(payload, "itemId"))
    slot = _s(payload, "slot")
    item.encaixado_em = slot
    correto = slot == item.slot
    _set_radar(state, Senso.SEITON, sum(i.encaixado_em == i.slot for i in state.seiton), len(state.seiton))
    state.score += scoring.pontos_classificacao(correto, state.streak)
    _registrar(state, correto)
    _talvez_desafio(state)
    msg = "Encaixe perfeito — cada coisa no seu lugar!" if correto else "Esse contorno é de outra peça."
    return CommandOutcome(correto, "comemora" if correto else "boasvindas", msg)


def _seiso_limpar(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    tile = next(t for t in state.seiso if t.id == _s(payload, "tileId"))
    if not tile.limpo:
        tile.limpo = True
        state.score += scoring.PONTOS_ACERTO  # inspecionar é a ação que pontua
    _recompute_seiso(state)
    return CommandOutcome(True, "pergunta", f"Achado: “{tile.descricao}”. É anomalia? Registre ou ignore.")


def _seiso_decidir(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    tile = next(t for t in state.seiso if t.id == _s(payload, "tileId"))
    decisao = _s(payload, "decisao")
    if decisao not in ("registrar", "ignorar"):
        raise UnknownCommand("decisão inválida")
    if not tile.limpo or tile.decisao is not None:
        return CommandOutcome(None, "pergunta", "Inspecione a área antes de decidir.")
    tile.decisao = decisao
    registrou = decisao == "registrar"
    correto = registrou == tile.is_anomalia
    if registrou and not tile.is_anomalia:
        state.falsos_positivos += 1
    if correto:
        state.score += scoring.PONTOS_ANOMALIA  # decisão certa pontua; errada vale 0
    _recompute_seiso(state)
    _registrar(state, correto)
    if correto:
        if registrou:
            return CommandOutcome(True, "comemora", "Anomalia registrada — você evitou uma falha futura!")
        return CommandOutcome(True, "aprova", "Certo: nada de anormal aqui. Foco no que importa!")
    if registrou:
        return CommandOutcome(False, "boasvindas", "Falso positivo: isso era mundano. Registrar demais vira ruído.")
    return CommandOutcome(False, "pergunta", "Você ignorou uma anomalia real — atenção redobrada!")


def _seiso_acertou(tile: SeisoTile) -> bool:
    return tile.decisao is not None and (tile.decisao == "registrar") == tile.is_anomalia


def _recompute_seiso(state: GameState) -> None:
    corretos = sum(_seiso_acertou(t) for t in state.seiso)
    _set_radar(state, Senso.SEISO, corretos, len(state.seiso))


def _seiketsu_snapshot(state: GameState) -> CommandOutcome:
    if not state.seiketsu_snapshot:
        perm = content.shuffle_seiketsu(state.seed, len(state.seiketsu))
        for spot in state.seiketsu:
            spot.posicao_atual = perm[spot.posicao_correta]
        state.seiketsu_snapshot = True
    return CommandOutcome(None, "pergunta", "Padrão fotografado! Compare cada item com a foto: conforme ou desvio?")


def _seiketsu_desvio(spot: SeiketsuSpot) -> bool:
    return spot.posicao_atual is not None and spot.posicao_atual != spot.posicao_correta


def _seiketsu(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    if not state.seiketsu_snapshot:
        return CommandOutcome(None, "pergunta", "Tire o snapshot do padrão primeiro.")
    spot = next(s for s in state.seiketsu if s.id == _s(payload, "spotId"))
    marcou = _b(payload, "desvio")
    spot.avaliado_como_desvio = marcou
    era_desvio = _seiketsu_desvio(spot)
    correto = marcou == era_desvio
    if marcou and not era_desvio:
        state.falsos_positivos += 1
    if correto:
        state.score += scoring.PONTOS_DECISAO  # decisão certa pontua; errada vale 0
    corretos = sum(
        s.avaliado_como_desvio == _seiketsu_desvio(s)
        for s in state.seiketsu
        if s.avaliado_como_desvio is not None
    )
    _set_radar(state, Senso.SEIKETSU, corretos, len(state.seiketsu))
    _registrar(state, correto)
    msg = "Posição certa na mosca!" if correto else "Olhe de novo: compare com a foto do padrão."
    return CommandOutcome(correto, "comemora" if correto else "boasvindas", msg)


def _shitsuke(state: GameState, payload: dict[str, object], now: float) -> CommandOutcome:
    _decay(state, now)
    item = next(i for i in state.shitsuke if i.id == _s(payload, "itemId"))
    item.conforme = True
    conformes = sum(i.conforme for i in state.shitsuke)
    _set_radar(state, Senso.SHITSUKE, conformes, len(state.shitsuke))
    for senso in PHASE_ORDER:
        state.radar[senso] = min(100.0, state.radar[senso] + BUMP_SUSTENTACAO)
    state.score += scoring.pontos_classificacao(True, state.streak)
    _registrar(state, True)
    return CommandOutcome(True, "aprova", "Auditoria corrigida — disciplina sustenta o 5S!")


def _decay(state: GameState, now: float) -> None:
    ativo = state.current_phase == Senso.SHITSUKE and not state.finished
    state.radar, state.last_decay_at = aplicar_decay(state.radar, state.last_decay_at, now, ativo)


def tick_decay(state: GameState, now: float) -> bool:
    """Aplica o decaimento temporal (usado pelo push periódico do SSE).

    Retorna True se a fase de sustentação está ativa (logo, vale empurrar)."""
    ativo = state.current_phase == Senso.SHITSUKE and not state.finished
    if ativo:
        _decay(state, now)
    return ativo


def _desafio(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    if state.desafio is None:
        raise UnknownCommand("nenhum desafio ativo")
    escolha = Senso(_i(payload, "senso"))
    correto = situacoes.is_correct(state.desafio.situacao_id, escolha)
    state.desafio.resolvido = True
    state.score += scoring.pontos_classificacao(correto, state.streak)
    _registrar(state, correto)
    certo = situacoes.senso_correto(state.desafio.situacao_id)
    state.desafio = None
    if correto:
        return CommandOutcome(True, "comemora", "Acertou o senso! Streak crescendo. 🔥")
    return CommandOutcome(False, "boasvindas", f"O senso certo era {certo.name} — por isso resolve essa situação.")


def _talvez_desafio(state: GameState) -> None:
    if state.desafio is None and state.acoes > 0 and state.acoes % ACOES_POR_DESAFIO == 0:
        state.desafio = content.next_desafio(state.seed, state.acoes)


def _avancar(state: GameState, now: float) -> CommandOutcome:
    idx = PHASE_ORDER.index(state.current_phase)
    if state.current_phase == Senso.SHITSUKE:
        if score_5s(state) >= 60.0:
            state.finished = True
            _conceder_badges(state)
            return CommandOutcome(True, "comemora", "Jornada concluída! Bem-vindo ao Hall 5S. 🏆")
        return CommandOutcome(None, "pergunta", "Sustente o 5S Score acima de 60 para concluir.")
    if state.radar[state.current_phase] < 70.0:
        return CommandOutcome(None, "pergunta", "Atinja 70 no radar desta fase para liberar a próxima.")
    state.current_phase = PHASE_ORDER[idx + 1]
    state.last_decay_at = now
    return CommandOutcome(True, "aprova", f"Fase liberada: {state.current_phase.name}!")


def _conceder_badges(state: GameState) -> None:
    if all(i.resolvido == i.destino for i in state.seiri):
        state.badges.add("Zero Refugo")
    if all(t.decisao == "registrar" for t in state.seiso if t.is_anomalia):
        state.badges.add("Caçador de Anomalias")
    if state.falsos_positivos == 0 and any(_seiketsu_desvio(s) for s in state.seiketsu):
        state.badges.add("Olho de Águia")
    if state.melhor_streak >= 10:
        state.badges.add("Sequência Perfeita")
    if all(v >= 90.0 for v in state.radar.values()):
        state.badges.add("Mestre dos Sensos")
