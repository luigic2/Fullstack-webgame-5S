"""Testes do domínio: validador de senso, máquina de estados, pontuação,
decaimento e plausibilidade."""

from __future__ import annotations

import pytest

from app.domain import engine, situacoes
from app.domain.decay import DECAY_POR_SEGUNDO, DURACAO_DESAFIO, FATOR_CHOQUE, aplicar_decay, setores_do_choque
from app.domain.plausibility import ImplausibleError, checar_cadencia
from app.domain.scoring import PONTOS_ERRO, pontos_classificacao, pontos_deteccao
from app.domain.sensos import PHASE_ORDER, Senso
from app.domain.state import SeiriZona, public_view, score_5s


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


def test_seiso_score_maximo_play_perfeito() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    # Limpar todos os tiles: cada inspeção vale PONTOS_ACERTO (100).
    for tile in state.seiso:
        engine.apply(state, "seiso.limpar", {"tileId": tile.id}, 1.0)
    assert state.score == 100 * len(state.seiso)
    # A descrição é revelada após limpar; o gabarito (is_anomalia) NUNCA vaza.
    seiso_view = public_view(state)["phases"]["SEISO"]  # type: ignore[index]
    for tv in seiso_view:
        assert tv["descricao"] is not None
        assert "is_anomalia" not in tv
    # Decisão correta em cada tile (registrar anomalia, ignorar mundano) → +60 cada.
    score_pos_limpeza = state.score
    for tile in state.seiso:
        decisao = "registrar" if tile.is_anomalia else "ignorar"
        engine.apply(state, "seiso.decidir", {"tileId": tile.id, "decisao": decisao}, 2.0)
    assert state.score == score_pos_limpeza + 60 * len(state.seiso)
    assert state.falsos_positivos == 0
    assert state.radar[Senso.SEISO] == 100.0


def test_seiso_decisao_errada_nao_pontua() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    mundano = next(t for t in state.seiso if not t.is_anomalia)
    anomalia = next(t for t in state.seiso if t.is_anomalia)
    engine.apply(state, "seiso.limpar", {"tileId": mundano.id}, 1.0)
    engine.apply(state, "seiso.limpar", {"tileId": anomalia.id}, 1.0)
    base = state.score  # só os pontos de limpeza
    # Registrar um mundano = falso positivo: 0 pontos (sem penalidade).
    out = engine.apply(state, "seiso.decidir", {"tileId": mundano.id, "decisao": "registrar"}, 2.0)
    assert out.correto is False
    assert state.score == base
    assert state.falsos_positivos == 1
    # Ignorar uma anomalia real: 0 pontos.
    out2 = engine.apply(state, "seiso.decidir", {"tileId": anomalia.id, "decisao": "ignorar"}, 3.0)
    assert out2.correto is False
    assert state.score == base


def test_seiketsu_snapshot_e_comparacao() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    # Antes do snapshot o gabarito de posição nunca vaza.
    antes = public_view(state)["phases"]["SEIKETSU"]  # type: ignore[index]
    assert "desvio" not in antes["referencia"][0]
    for slot in antes["atual"]:
        assert slot["acertou"] is None
    # O snapshot embaralha exatamente 3 itens (3-ciclo) → 3 desvios / 3 conformes.
    engine.apply(state, "seiketsu.snapshot", {}, 1.0)
    desvios = [s for s in state.seiketsu if s.posicao_atual != s.posicao_correta]
    assert len(desvios) == 3
    # Avaliar cada item corretamente → +60 cada, radar 100, sem falso positivo.
    for spot in state.seiketsu:
        era_desvio = spot.posicao_atual != spot.posicao_correta
        engine.apply(state, "seiketsu.avaliar", {"spotId": spot.id, "desvio": era_desvio}, 2.0)
    assert state.score == 60 * len(state.seiketsu)
    assert state.falsos_positivos == 0
    assert state.radar[Senso.SEIKETSU] == 100.0
    # A resposta pública nunca expõe a flag de gabarito por item.
    depois = public_view(state)["phases"]["SEIKETSU"]  # type: ignore[index]
    for slot in depois["atual"]:
        assert "desvio" not in slot
        assert slot["acertou"] is True


def test_seiketsu_avaliacao_errada_nao_pontua() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    engine.apply(state, "seiketsu.snapshot", {}, 1.0)
    conforme = next(s for s in state.seiketsu if s.posicao_atual == s.posicao_correta)
    desvio = next(s for s in state.seiketsu if s.posicao_atual != s.posicao_correta)
    # Marcar desvio num item conforme = falso positivo: 0 pontos (sem penalidade).
    out = engine.apply(state, "seiketsu.avaliar", {"spotId": conforme.id, "desvio": True}, 2.0)
    assert out.correto is False
    assert state.score == 0
    assert state.falsos_positivos == 1
    # Marcar conforme num item que mudou de lugar = desvio ignorado: 0 pontos.
    out2 = engine.apply(state, "seiketsu.avaliar", {"spotId": desvio.id, "desvio": False}, 3.0)
    assert out2.correto is False
    assert state.score == 0


def _entrar_shitsuke(seed: int) -> engine.GameState:
    state = engine.new_game("s", seed=seed, now=0.0)
    state.current_phase = Senso.SHITSUKE
    state.radar = dict.fromkeys(PHASE_ORDER, 100.0)
    state.last_decay_at = 0.0
    state.shitsuke_last_shock_at = 0.0
    return state


def test_shitsuke_choque_atinge_dois_setores() -> None:
    state = _entrar_shitsuke(seed=1)
    engine.apply(state, "shitsuke.tick", {}, now=6.0)
    assert state.shitsuke_choques == 1
    a, b = setores_do_choque(1, 0)
    base = 100.0 - 6.0 * DECAY_POR_SEGUNDO  # decaimento aplicado antes do choque
    assert state.radar[a] == pytest.approx(base * FATOR_CHOQUE)
    assert state.radar[b] == pytest.approx(base * FATOR_CHOQUE)
    intacto = next(s for s in PHASE_ORDER if s not in (a, b))
    assert state.radar[intacto] == pytest.approx(base)


def test_shitsuke_sustentacao_libera_conclusao() -> None:
    state = _entrar_shitsuke(seed=1)
    engine.apply(state, "shitsuke.tick", {}, now=1.0)
    assert state.shitsuke_sustain_since == 1.0
    # Média despenca abaixo da meta → cronômetro reseta.
    state.radar = dict.fromkeys(PHASE_ORDER, 40.0)
    engine.apply(state, "shitsuke.tick", {}, now=2.0)
    assert state.shitsuke_sustain_since is None
    assert state.shitsuke_restante == DURACAO_DESAFIO
    # Recupera e sustenta ≥ meta por 30s contínuos (auditoria perfeita) → conclui.
    for t in range(3, 34):
        state.radar = dict.fromkeys(PHASE_ORDER, 100.0)
        engine.apply(state, "shitsuke.tick", {}, now=float(t))
    assert state.shitsuke_sustentado is True
    out = engine.apply(state, "fase.avancar", {}, now=34.0)
    assert out.correto is True
    assert state.finished is True


def test_score_5s_e_media_dos_eixos() -> None:
    state = engine.new_game("s", seed=1, now=0.0)
    state.radar = dict.fromkeys(PHASE_ORDER, 80.0)
    assert score_5s(state) == 80.0
