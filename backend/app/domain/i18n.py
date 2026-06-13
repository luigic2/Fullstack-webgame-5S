"""Catálogo de textos do Mentor (feedback dos comandos) por idioma.

As mensagens vivem aqui, indexadas por uma chave semântica, com placeholders
no estilo `{nome}`. O `engine` chama `t(lang, chave, **params)` para obter o
texto já localizado. Toda chave existe em PT e EN (garantido por teste).
"""

from __future__ import annotations

from .sensos import Lang

# chave → idioma → texto (com placeholders {param}).
MENSAGENS: dict[str, dict[Lang, str]] = {
    # SEIRI
    "seiri.correto": {
        "pt": "Isso! {nome} no lugar certo.",
        "en": "That's it! {nome} in the right place.",
    },
    "seiri.errado": {
        "pt": "Quase. Item raro ou pouco usado vai pra etiqueta vermelha.",
        "en": "Almost. A rare or seldom-used item goes to the red tag.",
    },
    # SEITON
    "seiton.correto": {
        "pt": "Encaixe perfeito — cada coisa no seu lugar!",
        "en": "Perfect fit — everything in its place!",
    },
    "seiton.errado": {
        "pt": "Esse contorno é de outra peça.",
        "en": "That outline belongs to another tool.",
    },
    # SEISO
    "seiso.achado": {
        "pt": "Achado: “{descricao}”. É anomalia? Registre ou ignore.",
        "en": "Found: “{descricao}”. Is it an anomaly? Log it or ignore it.",
    },
    "seiso.decidir_antes": {
        "pt": "Inspecione a área antes de decidir.",
        "en": "Inspect the area before deciding.",
    },
    "seiso.anomalia_registrada": {
        "pt": "Anomalia registrada — você evitou uma falha futura!",
        "en": "Anomaly logged — you prevented a future failure!",
    },
    "seiso.ignorou_certo": {
        "pt": "Certo: nada de anormal aqui. Foco no que importa!",
        "en": "Correct: nothing abnormal here. Focus on what matters!",
    },
    "seiso.falso_positivo": {
        "pt": "Falso positivo: isso era mundano. Registrar demais vira ruído.",
        "en": "False positive: that was mundane. Over-logging becomes noise.",
    },
    "seiso.ignorou_anomalia": {
        "pt": "Você ignorou uma anomalia real — atenção redobrada!",
        "en": "You ignored a real anomaly — stay sharp!",
    },
    # SEIKETSU
    "seiketsu.snapshot": {
        "pt": "Padrão fotografado! Compare cada item com a foto: conforme ou desvio?",
        "en": "Standard captured! Compare each item with the photo: compliant or deviation?",
    },
    "seiketsu.snapshot_antes": {
        "pt": "Tire o snapshot do padrão primeiro.",
        "en": "Take the snapshot of the standard first.",
    },
    "seiketsu.correto": {
        "pt": "Posição certa na mosca!",
        "en": "Spot on!",
    },
    "seiketsu.errado": {
        "pt": "Olhe de novo: compare com a foto do padrão.",
        "en": "Look again: compare with the standard photo.",
    },
    # SHITSUKE
    "shitsuke.corrigido": {
        "pt": "Auditoria corrigida — disciplina sustenta o 5S!",
        "en": "Audit fixed — discipline sustains the 5S!",
    },
    "shitsuke.iniciado": {
        "pt": "Desafio iniciado — sustente o padrão por 30s!",
        "en": "Challenge started — sustain the standard for 30s!",
    },
    "shitsuke.tick": {
        "pt": "A entropia avança — sustente o padrão!",
        "en": "Entropy advances — sustain the standard!",
    },
    # Desafio do Mestre
    "desafio.correto": {
        "pt": "Acertou o senso! Streak crescendo. 🔥",
        "en": "Right sense! Streak growing. 🔥",
    },
    "desafio.errado": {
        "pt": "O senso certo era {senso} — por isso resolve essa situação.",
        "en": "The right sense was {senso} — that's what solves this situation.",
    },
    # Avanço de fase / conclusão
    "fase.concluida": {
        "pt": "Jornada concluída! 5S sustentado sob pressão. 🏆",
        "en": "Journey complete! 5S sustained under pressure. 🏆",
    },
    "fase.sustentar": {
        "pt": "Sustente a média ≥50% até o cronômetro zerar para concluir.",
        "en": "Sustain the average ≥50% until the timer hits zero to finish.",
    },
    "fase.bloqueada": {
        "pt": "Atinja 70 no radar desta fase para liberar a próxima.",
        "en": "Reach 70 on this phase's radar to unlock the next one.",
    },
    "fase.liberada": {
        "pt": "Fase liberada: {senso}!",
        "en": "Phase unlocked: {senso}!",
    },
}


def t(lang: Lang, key: str, **params: object) -> str:
    """Texto localizado do Mentor para `key`, com substituição de placeholders."""
    texto = MENSAGENS[key][lang]
    if params:
        return texto.format(**params)
    return texto
