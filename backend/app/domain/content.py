"""Geração determinística do conteúdo das fases a partir da seed da partida.

Mesma seed → mesmo conteúdo (reprodutibilidade). Os gabaritos (destino de
cada item, anomalias, desvios) ficam só no estado interno; ver `state.py`.

Os textos vêm em par `(pt, en)`; a amostragem (`rng.sample`) é feita sobre o
mesmo pool independentemente do idioma, então a mesma seed produz os mesmos
itens/IDs em PT e EN — só muda o texto exibido.
"""

from __future__ import annotations

import random

from . import situacoes
from .sensos import PHASE_ORDER, Lang, Senso
from .state import (
    Desafio,
    SeiketsuSpot,
    SeiriItem,
    SeiriZona,
    SeisoTile,
    SeitonItem,
    ShitsukeItem,
)

# Texto bilíngue: (português, inglês).
_T = tuple[str, str]


def _txt(par: _T, lang: Lang) -> str:
    return par[0] if lang == "pt" else par[1]


# Pool curado da bancada SEIRI: nome, emoji, dica e destino correto (gabarito).
_SEIRI_POOL: tuple[tuple[_T, str, _T, SeiriZona], ...] = (
    (
        ("Chave de fenda em uso diário", "Screwdriver in daily use"),
        "🪛",
        ("Ferramenta necessária do posto", "Necessary tool for the station"),
        SeiriZona.MANTER,
    ),
    (
        ("Paquímetro do operador", "Operator's caliper"),
        "📏",
        ("Usado toda hora — fica à mão", "Used all the time — keep it handy"),
        SeiriZona.MANTER,
    ),
    (
        ("EPI (luva) em bom estado", "PPE (glove) in good shape"),
        "🧤",
        ("Necessário e válido", "Necessary and valid"),
        SeiriZona.MANTER,
    ),
    (
        ("Manual do equipamento", "Equipment manual"),
        "📘",
        ("Consulta frequente", "Consulted frequently"),
        SeiriZona.MANTER,
    ),
    (
        ("Torquímetro caro de uso raro", "Expensive torque wrench, rarely used"),
        "🔧",
        ("Vale muito, mas usado 1x/mês", "Worth a lot, but used once a month"),
        SeiriZona.RED_TAG,
    ),
    (
        ("Molde de produto descontinuado", "Mold for a discontinued product"),
        "🧱",
        ("Talvez volte — etiqueta vermelha", "Might come back — red tag it"),
        SeiriZona.RED_TAG,
    ),
    (
        ("Peça boa de outro setor", "Good part from another area"),
        "⚙️",
        ("Não é deste posto, mas tem valor", "Not from this station, but has value"),
        SeiriZona.RED_TAG,
    ),
    (
        ("Refugo / peça quebrada", "Scrap / broken part"),
        "🗑️",
        ("Sucata sem reaproveitamento", "Scrap with no reuse"),
        SeiriZona.DESCARTAR,
    ),
    (
        ("EPI vencido", "Expired PPE"),
        "🦺",
        ("Vencido: risco — descartar", "Expired: a hazard — discard it"),
        SeiriZona.DESCARTAR,
    ),
    (
        ("Embalagem vazia amassada", "Crushed empty packaging"),
        "📦",
        ("Lixo no posto", "Trash at the station"),
        SeiriZona.DESCARTAR,
    ),
    (
        ("Estopa usada com óleo", "Oily used rag"),
        "🧽",
        ("Resíduo contaminado", "Contaminated waste"),
        SeiriZona.DESCARTAR,
    ),
    (
        ("Duplicata de ferramenta sem uso", "Unused duplicate tool"),
        "🔨",
        ("Excesso — vai pro almoxarifado", "Surplus — send it to the storeroom"),
        SeiriZona.RED_TAG,
    ),
)

_SEITON_POOL: tuple[tuple[_T, str, str, bool], ...] = (
    (("Chave de boca 10mm", "10mm open-end wrench"), "🔧", "slot-a", True),
    (("Alicate universal", "Combination pliers"), "🗜️", "slot-b", True),
    (("Martelo de borracha", "Rubber mallet"), "🔨", "slot-c", False),
    (("Lubrificante spray", "Spray lubricant"), "🛢️", "slot-d", False),
    (("Trena 5m", "5m tape measure"), "📏", "slot-e", True),
    (("Nível de bolha", "Bubble level"), "📐", "slot-f", False),
)

# (nome, emoji, descrição revelada ao limpar, is_anomalia). Os mundanos têm
# achados banais de propósito: o jogador precisa julgar, não só clicar.
_SEISO_POOL: tuple[tuple[_T, str, _T, bool], ...] = (
    (
        ("Bancada com poeira", "Dusty workbench"),
        "🪟",
        ("Só poeira leve — superfície íntegra", "Just light dust — surface intact"),
        False,
    ),
    (
        ("Piso com mancha de óleo", "Floor with an oil stain"),
        "🛢️",
        ("Vazamento de óleo no flange inferior", "Oil leak at the lower flange"),
        True,
    ),
    (
        ("Painel elétrico empoeirado", "Dusty electrical panel"),
        "🔌",
        ("Fio desencapado exposto", "Exposed bare wire"),
        True,
    ),
    (
        ("Vidro da máquina embaçado", "Foggy machine glass"),
        "🪞",
        ("Vidro limpo, sem trincas", "Clean glass, no cracks"),
        False,
    ),
    (
        ("Base do motor suja", "Dirty motor base"),
        "⚙️",
        ("Parafuso de fixação solto", "Loose mounting bolt"),
        True,
    ),
    (
        ("Canto da sala com restos", "Room corner with debris"),
        "🧹",
        ("Canto limpo, sem sujeira", "Clean corner, no dirt"),
        False,
    ),
)

_SEIKETSU_POOL: tuple[tuple[_T, str], ...] = (
    (("Marcação de piso (corredor)", "Floor marking (aisle)"), "🟨"),
    (("Etiqueta de prateleira", "Shelf label"), "🏷️"),
    (("Limite mín–máx do estoque", "Min–max stock limit"), "📊"),
    (("Quadro de gestão à vista", "Visual management board"), "📋"),
    (("Sinalização de extintor", "Fire extinguisher sign"), "🧯"),
    (("Identificação de tubulação", "Pipe identification"), "🎨"),
)

_SHITSUKE_TEXTOS: dict[Senso, _T] = {
    Senso.SEIRI: ("Só o necessário segue na bancada?", "Only the necessary remains on the bench?"),
    Senso.SEITON: ("Cada item está no seu lugar marcado?", "Is each item in its marked place?"),
    Senso.SEISO: ("A área segue limpa e inspecionada?", "Is the area still clean and inspected?"),
    Senso.SEIKETSU: ("Os padrões visuais continuam visíveis?", "Are the visual standards still visible?"),
    Senso.SHITSUKE: ("A equipe mantém a rotina por hábito?", "Does the team keep the routine by habit?"),
}


def _rng(seed: int, salt: int) -> random.Random:
    return random.Random(seed * 1000 + salt)


def gen_seiri(seed: int, lang: Lang = "pt") -> list[SeiriItem]:
    rng = _rng(seed, 1)
    escolhidos = rng.sample(_SEIRI_POOL, k=8)
    return [
        SeiriItem(id=f"seiri-{i}", nome=_txt(n, lang), emoji=e, dica=_txt(d, lang), destino=z)
        for i, (n, e, d, z) in enumerate(escolhidos)
    ]


def gen_seiton(seed: int, lang: Lang = "pt") -> list[SeitonItem]:
    rng = _rng(seed, 2)
    escolhidos = rng.sample(_SEITON_POOL, k=5)
    return [
        SeitonItem(id=f"seiton-{i}", nome=_txt(n, lang), emoji=e, slot=slot, ergonomico=ergo)
        for i, (n, e, slot, ergo) in enumerate(escolhidos)
    ]


def gen_seiso(seed: int, lang: Lang = "pt") -> list[SeisoTile]:
    rng = _rng(seed, 3)
    escolhidos = rng.sample(_SEISO_POOL, k=5)
    return [
        SeisoTile(id=f"seiso-{i}", nome=_txt(n, lang), emoji=e, descricao=_txt(d, lang), is_anomalia=li)
        for i, (n, e, d, li) in enumerate(escolhidos)
    ]


def gen_seiketsu(seed: int, lang: Lang = "pt") -> list[SeiketsuSpot]:
    rng = _rng(seed, 4)
    escolhidos = rng.sample(_SEIKETSU_POOL, k=6)
    # A ordem inicial é o padrão de referência; o embaralhamento vem no snapshot.
    return [
        SeiketsuSpot(id=f"seiketsu-{i}", nome=_txt(n, lang), emoji=e, posicao_correta=i)
        for i, (n, e) in enumerate(escolhidos)
    ]


def shuffle_seiketsu(seed: int, n: int) -> list[int]:
    """Permutação determinística do snapshot: um 3-ciclo move exatamente 3 itens
    (3 desvios / 3 conformes). `perm[i]` é o novo slot do item na posição `i`."""
    rng = _rng(seed, 5)
    perm = list(range(n))
    a, b, c = rng.sample(range(n), k=3)
    perm[a], perm[b], perm[c] = b, c, a
    return perm


def gen_shitsuke(seed: int, lang: Lang = "pt") -> list[ShitsukeItem]:
    return [
        ShitsukeItem(id=f"shitsuke-{int(s)}", senso=s, texto=_txt(_SHITSUKE_TEXTOS[s], lang))
        for s in PHASE_ORDER
    ]


def next_desafio(seed: int, acao_idx: int, lang: Lang = "pt") -> Desafio:
    """Escolhe uma situação do banco das 100 para o Desafio do Mestre."""
    ids = situacoes.all_ids()
    rng = _rng(seed, 100 + acao_idx)
    sid = rng.choice(ids)
    return Desafio(situacao_id=sid, texto=situacoes.texto(sid, lang))
