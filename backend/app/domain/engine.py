"""Reducer autoritativo: cria a partida e aplica comandos ao estado.

Toda regra de negócio (validação de senso, pontuação, avanço de fase,
decaimento) vive aqui. A camada HTTP só traduz DTOs ↔ comandos e serializa
a `public_view`. Nenhum gabarito sai deste módulo.
"""

from __future__ import annotations

from dataclasses import dataclass

from . import content, scoring, situacoes
from .decay import (
    DURACAO_DESAFIO,
    FATOR_CHOQUE,
    INTERVALO_CHOQUE,
    META_SUSTENTACAO,
    aplicar_decay,
    setores_do_choque,
)
from .i18n import t
from .sensos import PHASE_ORDER, Lang, Senso
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


def new_game(session_id: str, seed: int, now: float, lang: Lang = "pt") -> GameState:
    state = GameState(
        session_id=session_id,
        seed=seed,
        created_at=now,
        last_decay_at=now,
        lang=lang,
        seiri=content.gen_seiri(seed, lang),
        seiton=content.gen_seiton(seed, lang),
        seiso=content.gen_seiso(seed, lang),
        seiketsu=content.gen_seiketsu(seed, lang),
        shitsuke=content.gen_shitsuke(seed, lang),
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
    if ctype == "shitsuke.iniciar":
        return _shitsuke_iniciar(state, now)
    if ctype == "shitsuke.corrigir":
        return _shitsuke(state, payload, now)
    if ctype == "shitsuke.tick":
        _processar_shitsuke(state, now)
        return CommandOutcome(None, "pergunta", t(state.lang, "shitsuke.tick"))
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
        return CommandOutcome(True, "comemora", t(state.lang, "seiri.correto", nome=item.nome))
    return CommandOutcome(False, "boasvindas", t(state.lang, "seiri.errado"))


def _seiton(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    item = next(i for i in state.seiton if i.id == _s(payload, "itemId"))
    slot = _s(payload, "slot")
    item.encaixado_em = slot
    correto = slot == item.slot
    _set_radar(state, Senso.SEITON, sum(i.encaixado_em == i.slot for i in state.seiton), len(state.seiton))
    state.score += scoring.pontos_classificacao(correto, state.streak)
    _registrar(state, correto)
    _talvez_desafio(state)
    msg = t(state.lang, "seiton.correto") if correto else t(state.lang, "seiton.errado")
    return CommandOutcome(correto, "comemora" if correto else "boasvindas", msg)


def _seiso_limpar(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    tile = next(t for t in state.seiso if t.id == _s(payload, "tileId"))
    if not tile.limpo:
        tile.limpo = True
        state.score += scoring.PONTOS_ACERTO  # inspecionar é a ação que pontua
    _recompute_seiso(state)
    return CommandOutcome(True, "pergunta", t(state.lang, "seiso.achado", descricao=tile.descricao))


def _seiso_decidir(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    tile = next(t for t in state.seiso if t.id == _s(payload, "tileId"))
    decisao = _s(payload, "decisao")
    if decisao not in ("registrar", "ignorar"):
        raise UnknownCommand("decisão inválida")
    if not tile.limpo or tile.decisao is not None:
        return CommandOutcome(None, "pergunta", t(state.lang, "seiso.decidir_antes"))
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
            return CommandOutcome(True, "comemora", t(state.lang, "seiso.anomalia_registrada"))
        return CommandOutcome(True, "aprova", t(state.lang, "seiso.ignorou_certo"))
    if registrou:
        return CommandOutcome(False, "boasvindas", t(state.lang, "seiso.falso_positivo"))
    return CommandOutcome(False, "pergunta", t(state.lang, "seiso.ignorou_anomalia"))


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
    return CommandOutcome(None, "pergunta", t(state.lang, "seiketsu.snapshot"))


def _seiketsu_desvio(spot: SeiketsuSpot) -> bool:
    return spot.posicao_atual is not None and spot.posicao_atual != spot.posicao_correta


def _seiketsu(state: GameState, payload: dict[str, object]) -> CommandOutcome:
    if not state.seiketsu_snapshot:
        return CommandOutcome(None, "pergunta", t(state.lang, "seiketsu.snapshot_antes"))
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
    msg = t(state.lang, "seiketsu.correto") if correto else t(state.lang, "seiketsu.errado")
    return CommandOutcome(correto, "comemora" if correto else "boasvindas", msg)


def _shitsuke(state: GameState, payload: dict[str, object], now: float) -> CommandOutcome:
    _processar_shitsuke(state, now)
    item = next(i for i in state.shitsuke if i.id == _s(payload, "itemId"))
    item.conforme = True
    conformes = sum(i.conforme for i in state.shitsuke)
    _set_radar(state, Senso.SHITSUKE, conformes, len(state.shitsuke))
    for senso in PHASE_ORDER:
        state.radar[senso] = min(100.0, state.radar[senso] + BUMP_SUSTENTACAO)
    state.score += scoring.pontos_classificacao(True, state.streak)
    _registrar(state, True)
    _avaliar_sustentacao(state, now)  # o bump pode reerguer a média acima da meta
    return CommandOutcome(True, "aprova", t(state.lang, "shitsuke.corrigido"))


def _shitsuke_iniciar(state: GameState, now: float) -> CommandOutcome:
    """Dispara o desafio de sustentação após o jogador dispensar o overlay de intro."""
    if not state.shitsuke_iniciado:
        state.shitsuke_iniciado = True
        state.shitsuke_last_shock_at = now
        state.last_decay_at = now
    return CommandOutcome(None, "comemora", t(state.lang, "shitsuke.iniciado"))


def _processar_shitsuke(state: GameState, now: float) -> None:
    """Decaimento contínuo + choques discretos (5s) + cronômetro de sustentação.

    Tudo derivado de `now - last_*` (timestamp+delta): minimizar a aba e voltar
    aplica de uma vez os choques e o decaimento do período ausente.
    Enquanto `shitsuke_iniciado` é False (overlay ainda visível), apenas avança
    os timestamps de referência para o desafio começar limpo."""
    if (
        state.current_phase != Senso.SHITSUKE
        or state.finished
        or state.shitsuke_sustentado
        or not state.shitsuke_iniciado
    ):
        state.last_decay_at = now
        state.shitsuke_last_shock_at = now
        return
    state.radar, state.last_decay_at = aplicar_decay(state.radar, state.last_decay_at, now, ativo=True)
    while now - state.shitsuke_last_shock_at >= INTERVALO_CHOQUE:
        a, b = setores_do_choque(state.seed, state.shitsuke_choques)
        state.radar[a] = max(0.0, state.radar[a] * FATOR_CHOQUE)
        state.radar[b] = max(0.0, state.radar[b] * FATOR_CHOQUE)
        state.shitsuke_choques += 1
        state.shitsuke_last_shock_at += INTERVALO_CHOQUE
    _avaliar_sustentacao(state, now)


def _avaliar_sustentacao(state: GameState, now: float) -> None:
    """Atualiza o cronômetro: sustentar a média ≥ meta por DURACAO segundos contínuos."""
    if score_5s(state) >= META_SUSTENTACAO:
        if state.shitsuke_sustain_since is None:
            state.shitsuke_sustain_since = now
        elif now - state.shitsuke_sustain_since >= DURACAO_DESAFIO:
            state.shitsuke_sustentado = True
    else:
        state.shitsuke_sustain_since = None  # caiu abaixo da meta → reseta o cronômetro
    if state.shitsuke_sustentado:
        state.shitsuke_restante = 0.0
    elif state.shitsuke_sustain_since is None:
        state.shitsuke_restante = DURACAO_DESAFIO
    else:
        state.shitsuke_restante = max(0.0, DURACAO_DESAFIO - (now - state.shitsuke_sustain_since))


def tick_decay(state: GameState, now: float) -> bool:
    """Avança o desafio de sustentação (usado pelo push periódico do SSE).

    Retorna True enquanto a fase SHITSUKE está em curso (logo, vale empurrar)."""
    ativo = state.current_phase == Senso.SHITSUKE and not state.finished
    if ativo:
        _processar_shitsuke(state, now)
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
        return CommandOutcome(True, "comemora", t(state.lang, "desafio.correto"))
    return CommandOutcome(False, "boasvindas", t(state.lang, "desafio.errado", senso=certo.name))


def _talvez_desafio(state: GameState) -> None:
    if state.desafio is None and state.acoes > 0 and state.acoes % ACOES_POR_DESAFIO == 0:
        state.desafio = content.next_desafio(state.seed, state.acoes, state.lang)


def _avancar(state: GameState, now: float) -> CommandOutcome:
    idx = PHASE_ORDER.index(state.current_phase)
    if state.current_phase == Senso.SHITSUKE:
        _processar_shitsuke(state, now)
        if state.shitsuke_sustentado:
            state.finished = True
            _conceder_badges(state)
            return CommandOutcome(True, "comemora", t(state.lang, "fase.concluida"))
        return CommandOutcome(None, "pergunta", t(state.lang, "fase.sustentar"))
    if state.radar[state.current_phase] < 70.0:
        return CommandOutcome(None, "pergunta", t(state.lang, "fase.bloqueada"))
    state.current_phase = PHASE_ORDER[idx + 1]
    state.last_decay_at = now
    if state.current_phase == Senso.SHITSUKE:
        state.shitsuke_iniciado = False
        state.shitsuke_last_shock_at = now
        state.shitsuke_choques = 0
        state.shitsuke_sustain_since = None
        state.shitsuke_sustentado = False
        state.shitsuke_restante = DURACAO_DESAFIO
    return CommandOutcome(True, "aprova", t(state.lang, "fase.liberada", senso=state.current_phase.name))


def _conceder_badges(state: GameState) -> None:
    # Badges são gravadas por CHAVE estável; o nome/descrição localizados são
    # responsabilidade do cliente (ver HallScreen).
    if all(i.resolvido == i.destino for i in state.seiri):
        state.badges.add("zero_refugo")
    if all(tile.decisao == "registrar" for tile in state.seiso if tile.is_anomalia):
        state.badges.add("cacador_anomalias")
    if state.falsos_positivos == 0 and any(_seiketsu_desvio(s) for s in state.seiketsu):
        state.badges.add("olho_aguia")
    if state.melhor_streak >= 10:
        state.badges.add("sequencia_perfeita")
    if all(v >= 90.0 for v in state.radar.values()):
        state.badges.add("mestre_sensos")
