"""Testes de internacionalização (PT/EN) do backend."""

from __future__ import annotations

from app.domain import content, engine, situacoes
from app.domain.i18n import MENSAGENS, t
from app.domain.sensos import PHASE_ORDER, Lang
from app.domain.state import maturidade, public_view, veredito

_LANGS: tuple[Lang, ...] = ("pt", "en")


def test_conteudo_mesmos_ids_textos_diferentes() -> None:
    # O mesmo seed produz os mesmos itens/IDs em PT e EN; só o texto muda.
    pt = content.gen_seiri(7, "pt")
    en = content.gen_seiri(7, "en")
    assert [i.id for i in pt] == [i.id for i in en]
    assert [i.destino for i in pt] == [i.destino for i in en]
    assert [i.nome for i in pt] != [i.nome for i in en]


def test_todas_as_situacoes_tem_traducao() -> None:
    for sid in situacoes.all_ids():
        pt = situacoes.texto(sid, "pt")
        en = situacoes.texto(sid, "en")
        assert pt and en
        assert pt == situacoes.texto(sid)  # default é PT


def test_catalogo_mentor_completo_nos_dois_idiomas() -> None:
    for key, traducoes in MENSAGENS.items():
        for lang in _LANGS:
            assert lang in traducoes, f"falta {lang} em {key}"
            assert traducoes[lang].strip()


def test_t_substitui_placeholders() -> None:
    assert t("pt", "seiri.correto", nome="Martelo") == "Isso! Martelo no lugar certo."
    assert "Hammer" in t("en", "seiri.correto", nome="Hammer")


def test_public_view_localiza_maturidade_e_veredito() -> None:
    state_pt = engine.new_game("a", seed=1, now=0.0, lang="pt")
    state_en = engine.new_game("b", seed=1, now=0.0, lang="en")
    state_pt.radar = dict.fromkeys(PHASE_ORDER, 100.0)
    state_en.radar = dict.fromkeys(PHASE_ORDER, 100.0)
    assert public_view(state_pt)["maturidade"] == "Diamante"
    assert public_view(state_en)["maturidade"] == "Diamond"
    assert maturidade(100.0, "en") == "Diamond"
    assert veredito(100.0, "en") == "5S Master"


def test_lang_default_e_propagado_para_o_conteudo() -> None:
    state = engine.new_game("c", seed=3, now=0.0, lang="en")
    assert state.lang == "en"
    # o checklist SHITSUKE nasce em inglês
    assert any("?" in i.texto for i in state.shitsuke)
    assert public_view(state)["sensos"][0]["pt"] == "Sort"
