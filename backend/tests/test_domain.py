"""Testes do domínio: validador de senso, máquina de estados, pontuação,
decaimento e plausibilidade."""

from __future__ import annotations

import pytest

from app.domain import engine, situacoes
from app.domain.decay import DECAY_POR_SEGUNDO, aplicar_decay
from app.domain.plausibility import ImplausibleError, checar_cadencia
from app.domain.scoring import PONTOS_ERRO, pontos_classificacao, pontos_deteccao
from app.domain.sensos import PHASE_ORDER, Senso
from app.domain.state import SeiriZona, score_5s


def test_banco_tem_100_situacoes() -> None:
    assert len(situacoes.all_ids()) == 100


def test_validador_senso_bate_com_gabarito_das_100() -> None:
    # O senso correto de cada situação valida positivo; qualquer outro, negativo.
    for sid in situacoes.all_ids():
        correto = situacoes.senso_correto(sid)
        assert situacoes.is_correct(sid, correto) is True
        for outro in PHASE_ORDER:
            if outro != correto:
                assert situacoes.is_correct(sid, outro) is False


def test_distribuicao_do_gabarito() -> None:
    contagem = {s: len(situacoes.ids_por_senso(s)) for s in PHASE_ORDER}
    assert contagem == {
        Senso.SEIRI: 14,
        Senso.SEITON: 22,
        Senso.SEISO: 19,
        Senso.SEIKETSU: 27,
        Senso.SHITSUKE: 18,
    }


def test_seed_reproduz_mesmo_conteudo() -> None:
    a = engine.new_game("s1", seed=42, now=0.0)
    b = engine.new_game("s2", seed=42, now=0.0)
    assert [i.destino for i in a.seiri] == [i.destino for i in b.seiri]


def test_pontuacao_acerto_vale_mais_que_erro() -> None:
    assert pontos_classificacao(True, 0) > 0
    assert pontos_classificacao(False, 0) == PONTOS_ERRO
    # streak dá bônus
    assert pontos_classificacao(True, 3) > pontos_classificacao(True, 0)


def test_deteccao_falso_positivo_penaliza() -> None:
    assert pontos_deteccao(True, True) > 0
    assert pontos_deteccao(True, False) < 0  # marcou desvio onde não havia
    assert pontos_deteccao(False, False) == 0


def test_maquina_de_estados_gating_de_fase() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    # Não avança SEIRI -> SEITON sem atingir 70 no radar.
    out = engine.apply(state, "fase.avancar", {}, now=1.0)
    assert out.correto is None
    assert state.current_phase == Senso.SEIRI
    # Resolve todos os itens corretamente -> radar 100 -> libera.
    for item in state.seiri:
        engine.apply(state, "seiri.classificar", {"itemId": item.id, "zona": item.destino.value}, 2.0)
    assert state.radar[Senso.SEIRI] == 100.0
    engine.apply(state, "fase.avancar", {}, now=3.0)
    assert state.current_phase == Senso.SEITON


def test_seiri_erro_reduz_e_ensina() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    item = next(i for i in state.seiri if i.destino != SeiriZona.DESCARTAR)
    out = engine.apply(state, "seiri.classificar", {"itemId": item.id, "zona": "descartar"}, 1.0)
    assert out.correto is False
    assert state.score == PONTOS_ERRO


def test_decaimento_usa_delta_temporal() -> None:
    radar = dict.fromkeys(PHASE_ORDER, 100.0)
    novo, last = aplicar_decay(radar, last_decay_at=0.0, now=10.0, ativo=True)
    esperado = 100.0 - 10.0 * DECAY_POR_SEGUNDO
    assert all(abs(v - esperado) < 1e-9 for v in novo.values())
    assert last == 10.0
    # Sem fase ativa, não decai.
    igual, _ = aplicar_decay(radar, 0.0, 10.0, ativo=False)
    assert igual == radar


def test_plausibilidade_rejeita_rajada() -> None:
    with pytest.raises(ImplausibleError):
        checar_cadencia([0.0, 0.01], agora=0.01)


def test_desafio_do_mestre_valida_no_servidor() -> None:
    state = engine.new_game("s", seed=7, now=0.0)
    # Dispara o desafio após ACOES_POR_DESAFIO ações.
    for item in state.seiri[: engine.ACOES_POR_DESAFIO]:
        engine.apply(state, "seiri.classificar", {"itemId": item.id, "zona": item.destino.value}, 1.0)
    assert state.desafio is not None
    sid = state.desafio.situacao_id
    correto = situacoes.senso_correto(sid)
    out = engine.apply(state, "desafio.classificar", {"senso": int(correto)}, 2.0)
    assert out.correto is True
    assert state.desafio is None


def test_score_5s_e_media_dos_eixos() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    state.radar = dict.fromkeys(PHASE_ORDER, 80.0)
    assert score_5s(state) == 80.0
