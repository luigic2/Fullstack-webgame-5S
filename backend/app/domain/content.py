"""Geração determinística do conteúdo das fases a partir da seed da partida.

Mesma seed → mesmo conteúdo (reprodutibilidade). Os gabaritos (destino de
cada item, anomalias, desvios) ficam só no estado interno; ver `state.py`.
"""

from __future__ import annotations

import random

from . import situacoes
from .sensos import PHASE_ORDER, Senso
from .state import (
    Desafio,
    SeiketsuSpot,
    SeiriItem,
    SeiriZona,
    SeisoTile,
    SeitonItem,
    ShitsukeItem,
)

# Pool curado da bancada SEIRI: nome, emoji, dica e destino correto (gabarito).
_SEIRI_POOL: tuple[tuple[str, str, str, SeiriZona], ...] = (
    ("Chave de fenda em uso diário", "🪛", "Ferramenta necessária do posto", SeiriZona.MANTER),
    ("Paquímetro do operador", "📏", "Usado toda hora — fica à mão", SeiriZona.MANTER),
    ("EPI (luva) em bom estado", "🧤", "Necessário e válido", SeiriZona.MANTER),
    ("Manual do equipamento", "📘", "Consulta frequente", SeiriZona.MANTER),
    ("Torquímetro caro de uso raro", "🔧", "Vale muito, mas usado 1x/mês", SeiriZona.RED_TAG),
    ("Molde de produto descontinuado", "🧱", "Talvez volte — etiqueta vermelha", SeiriZona.RED_TAG),
    ("Peça boa de outro setor", "⚙️", "Não é deste posto, mas tem valor", SeiriZona.RED_TAG),
    ("Refugo / peça quebrada", "🗑️", "Sucata sem reaproveitamento", SeiriZona.DESCARTAR),
    ("EPI vencido", "🦺", "Vencido: risco — descartar", SeiriZona.DESCARTAR),
    ("Embalagem vazia amassada", "📦", "Lixo no posto", SeiriZona.DESCARTAR),
    ("Estopa usada com óleo", "🧽", "Resíduo contaminado", SeiriZona.DESCARTAR),
    ("Duplicata de ferramenta sem uso", "🔨", "Excesso — vai pro almoxarifado", SeiriZona.RED_TAG),
)

_SEITON_POOL: tuple[tuple[str, str, str, bool], ...] = (
    ("Chave de boca 10mm", "🔧", "slot-a", True),
    ("Alicate universal", "🗜️", "slot-b", True),
    ("Martelo de borracha", "🔨", "slot-c", False),
    ("Lubrificante spray", "🛢️", "slot-d", False),
    ("Trena 5m", "📏", "slot-e", True),
    ("Nível de bolha", "📐", "slot-f", False),
)

_SEISO_POOL: tuple[tuple[str, str, str, bool | None], ...] = (
    ("Bancada com poeira", "🪟", "Bancada Vazia", False),
    ("Piso com mancha de óleo", "🛢️", "Vazamento no flange inferior", True),
    ("Painel elétrico empoeirado", "🔌", "Fio desencapado exposto", True),
    ("Vidro da máquina embaçado", "🪞", "Vidro limpo e seguro", False),
    ("Base do motor suja", "⚙️", "Parafuso de fixação solto", True),
    ("Canto da sala com restos", "🧹", "Canto Limpo e seguro", False),
)

_SEIKETSU_POOL: tuple[tuple[str, str], ...] = (
    ("Marcação de piso (corredor)", "🟨"),
    ("Etiqueta de prateleira", "🏷️"),
    ("Limite mín–máx do estoque", "📊"),
    ("Quadro de gestão à vista", "📋"),
    ("Sinalização de extintor", "🧯"),
    ("Identificação de tubulação", "🎨"),
)

_SHITSUKE_TEXTOS: dict[Senso, str] = {
    Senso.SEIRI: "Só o necessário segue na bancada?",
    Senso.SEITON: "Cada item está no seu lugar marcado?",
    Senso.SEISO: "A área segue limpa e inspecionada?",
    Senso.SEIKETSU: "Os padrões visuais continuam visíveis?",
    Senso.SHITSUKE: "A equipe mantém a rotina por hábito?",
}


def _rng(seed: int, salt: int) -> random.Random:
    return random.Random(seed * 1000 + salt)


def gen_seiri(seed: int) -> list[SeiriItem]:
    rng = _rng(seed, 1)
    escolhidos = rng.sample(_SEIRI_POOL, k=8)
    return [
        SeiriItem(id=f"seiri-{i}", nome=n, emoji=e, dica=d, destino=z)
        for i, (n, e, d, z) in enumerate(escolhidos)
    ]


def gen_seiton(seed: int) -> list[SeitonItem]:
    rng = _rng(seed, 2)
    escolhidos = rng.sample(_SEITON_POOL, k=5)
    return [
        SeitonItem(id=f"seiton-{i}", nome=n, emoji=e, slot=slot, ergonomico=ergo)
        for i, (n, e, slot, ergo) in enumerate(escolhidos)
    ]


def gen_seiso(seed: int) -> list[SeisoTile]:
    rng = _rng(seed, 3)
    escolhidos = rng.sample(_SEISO_POOL, k=5)
    return [
        SeisoTile(id=f"seiso-{i}", nome=n, emoji=e, anomalia=a, is_anomalia=li)
        for i, (n, e, a, li) in enumerate(escolhidos)
    ]


def gen_seiketsu(seed: int) -> list[SeiketsuSpot]:
    rng = _rng(seed, 4)
    escolhidos = rng.sample(_SEIKETSU_POOL, k=6)
    # Após o snapshot, ~metade recebe um desvio sutil (gabarito).
    com_desvio = set(rng.sample(range(len(escolhidos)), k=3))
    return [
        SeiketsuSpot(id=f"seiketsu-{i}", nome=n, emoji=e, desvio=(i in com_desvio))
        for i, (n, e) in enumerate(escolhidos)
    ]


def gen_shitsuke(seed: int) -> list[ShitsukeItem]:
    return [
        ShitsukeItem(id=f"shitsuke-{int(s)}", senso=s, texto=_SHITSUKE_TEXTOS[s])
        for s in PHASE_ORDER
    ]


def next_desafio(seed: int, acao_idx: int) -> Desafio:
    """Escolhe uma situação do banco das 100 para o Desafio do Mestre."""
    ids = situacoes.all_ids()
    rng = _rng(seed, 100 + acao_idx)
    sid = rng.choice(ids)
    return Desafio(situacao_id=sid, texto=situacoes.texto(sid))
