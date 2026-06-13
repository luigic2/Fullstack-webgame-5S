// Internacionalização do cliente (PT/EN). Apenas strings de UI que NÃO vêm do
// servidor moram aqui — o conteúdo e o feedback do Mentor já chegam localizados
// do backend. Os nomes japoneses dos sensos (Seiri…) nunca são traduzidos.
import type { SensoKey } from '../types'

export type Lang = 'pt' | 'en'

// Dicionário-fonte (PT). O tipo das chaves é derivado dele; o EN é obrigado
// pelo compilador a ter exatamente as mesmas chaves.
const pt = {
  // StartScreen
  'start.alt': 'Mestre 5S dando boas-vindas',
  'start.subtitle':
    'A Jornada dos Sensos. Transforme uma estação caótica numa estação 5S exemplar — aprendendo na prática, guiado pelo Mestre.',
  'start.beginAria': 'Começar a jornada 5S',
  'start.loading': 'Preparando o chão de fábrica…',
  'start.begin': '▶ Começar a jornada',
  'start.tagline': 'Single-player · sem cadastro · aprenda 5S em poucos minutos',
  'start.langPt': 'Jogar em português',
  'start.langEn': 'Jogar em inglês',

  // GameScreen
  'game.phaseLabel': 'Fase {n} de 5',
  'game.advance': '➡ Avançar fase',
  'game.finish': '🏆 Concluir jornada',

  // ResetButton
  'reset.trigger': '🔄 Reiniciar',
  'reset.triggerAria': 'Reiniciar o jogo desde a primeira fase',
  'reset.dialogAria': 'Confirmar reinício',
  'reset.title': 'Reiniciar do zero?',
  'reset.body': 'Você perde todo o progresso desta partida e volta para a primeira fase, com novos desafios.',
  'reset.cancel': 'Cancelar',
  'reset.confirm': 'Sim, reiniciar',

  // Onboarding
  'onb.title': 'Como jogar',
  'onb.b1': '🎯 Aplique os 5 sensos na ordem — cada fase tem uma ação diferente.',
  'onb.b2': '🖐️ Arraste, encaixe, limpe e audite. Aprende-se fazendo, não decorando.',
  'onb.b3': '📡 O Radar 5S mostra seu progresso ao vivo; o Mestre te guia o tempo todo.',
  'onb.b4': '⚡ De vez em quando vem o Desafio do Mestre — classifique a situação pelo senso certo.',
  'onb.startAria': 'Entendi, começar a jogar',
  'onb.cta': 'Bora! 🚀',

  // HallScreen
  'hall.alt': 'Mestre 5S comemorando',
  'hall.tag': 'Hall 5S',
  'hall.scoreLine': 'Selo {mat} · 5S Score {s5} · {pts} pts',
  'hall.beforeTitle': '🏚️ Antes',
  'hall.beforeText': 'Ferramentas largadas, refugo misturado, óleo no piso, etiquetas apagadas. Ninguém achava nada.',
  'hall.afterTitle': '✨ Depois',
  'hall.afterText': 'Só o necessário, cada coisa no lugar, limpo e inspecionado, padrão visível e sustentado por hábito.',
  'hall.badgesTitle': 'Badges conquistadas',
  'hall.noBadges': 'Nenhuma badge desta vez — jogue de novo e mire o ouro!',
  'hall.share': '📤 Compartilhar certificado',
  'hall.playAgain': '🔄 Jogar novamente',
  'hall.shareText': 'Concluí o eKaizen 5S como {veredito} ({mat}) com 5S Score {s5}! 🏆',

  // PhaseIntroOverlay
  'intro.alt': 'Mestre 5S',
  'intro.next': 'Avançar ▶',
  'intro.start': 'Começar fase ▶',
  'intro.p1.m1':
    'Bem-vindo ao chão de fábrica! Sou o Mestre 5S, seu guia nessa jornada para dominar a metodologia 5S, vamos transformar esse ambiente de trabalho juntos!',
  'intro.p1.m2':
    'O Primeiro Pilar da metodologia 5S é a SEIRI. ela se baseia na ideia da separação de tudo que é necessario daquilo que não é',
  'intro.p1.m3':
    'Itens desnecessários criam obstáculos e escondem problemas. Separe cada item da bancada entre: Manter, Etiqueta Vermelha ou Descartar. Foque no essencial!',
  'intro.p2.m1': 'SEIRI concluído! Agora é o SEITON — Senso de Ordenação.',
  'intro.p2.m2': 'O critério é simples: quanto mais usado, mais acessível deve estar. Organize!',
  'intro.p2.m3':
    'Cada ferramenta tem um lugar exato no shadow board. Veja os contornos e encaixe cada item onde ele pertence.',
  'intro.p3.m1': 'Parabéns pelo SEITON! Próxima fase: SEISO — Senso de Limpeza.',
  'intro.p3.m2': 'Esfregue cada área para revelar o achado escondido sob a sujeira.',
  'intro.p3.m3': 'Nem todo achado é problema: registre as anomalias reais e ignore o que é mundano.',
  'intro.p4.m1': 'SEISO concluído! Bem-vindo ao SEIKETSU — Senso de Padronização.',
  'intro.p4.m2': 'Fotografe o padrão para criar a referência. Depois os itens vão se embaralhar.',
  'intro.p4.m3': 'Compare cada item com a foto: marque conforme se está no lugar, desvio se mudou de posição.',
  'intro.p5.m1': 'Chegamos ao SHITSUKE — o Senso de Disciplina. A fase mais desafiadora!',
  'intro.p5.m2': 'A entropia não para: o radar decai e, a cada 5s, um choque derruba 2 setores em 20%.',
  'intro.p5.m3': 'Audite sem parar e mantenha a média ≥ 50% por 30 segundos contínuos para concluir a jornada!',

  // Hud
  'hud.score': '5S Score',
  'hud.points': 'Pontos',
  'hud.streak': 'Streak',
  'hud.progressAria': 'Progresso das fases',

  // Mentor
  'mentor.alt': 'Mentor 5S ({mood})',

  // Radar
  'radar.aria': 'Radar 5S com a pontuação de cada senso',

  // DesafioModal
  'desafio.aria': 'Desafio do Mestre',
  'desafio.title': '⚡ Desafio do Mestre',
  'desafio.prompt': 'Qual senso resolve esta situação? Arraste o card para o senso certo.',
  'desafio.situacaoAria': 'Situação: {texto}',
  'desafio.classificarAria': 'Classificar como {senso}',

  // SeiriPhase
  'seiri.zona.manter.t': 'Manter',
  'seiri.zona.manter.d': 'Necessário e em uso',
  'seiri.zona.redtag.t': 'Etiqueta vermelha',
  'seiri.zona.redtag.d': 'Raro/valioso → almoxarifado',
  'seiri.zona.descartar.t': 'Descartar',
  'seiri.zona.descartar.d': 'Refugo / sem valor',
  'seiri.bench': 'Bancada ({n} {w} para separar)',
  'seiri.item': 'item',
  'seiri.items': 'itens',
  'seiri.itemAria': '{nome}. {dica}. Arraste ou use os botões para classificar.',
  'seiri.done': 'Bancada separada! Avance para o próximo senso. ✅',

  // SeitonPhase
  'seiton.board': 'Shadow board — encaixe cada item no seu contorno',
  'seiton.tray': 'Bandeja ({n})',
  'seiton.itemAria': '{nome}. Arraste para o contorno correspondente.',
  'seiton.done': 'Tudo no lugar! Avance para o próximo senso. ✅',

  // SeisoPhase
  'seiso.intro':
    'Esfregue cada superfície e leia o achado. Nem tudo é anomalia: registre o que importa e ignore o resto.',
  'seiso.scrubAria': 'Esfregar {nome}',
  'seiso.scrub': '🧽 Esfregar',
  'seiso.logAria': 'Registrar anomalia em {nome}',
  'seiso.log': '🚩 Registrar',
  'seiso.ignoreAria': 'Ignorar {nome}',
  'seiso.ignore': '🙈 Ignorar',
  'seiso.res.logged': '✅ Anomalia registrada',
  'seiso.res.ignoredOk': '✅ Ignorado com razão',
  'seiso.res.falsePos': '⚠️ Falso positivo',
  'seiso.res.missed': '❌ Anomalia ignorada',

  // SeiketsuPhase
  'seiketsu.memorize':
    'Memorize a posição de cada item: esta é a referência. Ao fotografar, eles vão se embaralhar.',
  'seiketsu.snapshotBtn': '📸 Tirar snapshot do padrão',
  'seiketsu.compare':
    'Compare a fileira de cima com a foto. Marque conforme (mesma posição) ou desvio (mudou de lugar).',
  'seiketsu.refLabel': '📸 Padrão (referência)',
  'seiketsu.conformeAria': '{nome} está na posição do padrão (conforme)',
  'seiketsu.conforme': '✓ Conforme',
  'seiketsu.desvioAria': '{nome} mudou de posição (desvio)',
  'seiketsu.desvio': '⚠ Desvio',
  'seiketsu.resDesvio': 'Desvio',
  'seiketsu.resConforme': 'Conforme',

  // ShitsukePhase
  'shitsuke.sustained': '✅ Padrão sustentado! Pode concluir a jornada.',
  'shitsuke.keep': 'Mantenha a média ≥ {meta} até o cronômetro zerar. Choques atingem 2 setores a cada 5s.',
  'shitsuke.avg': 'média 5S',
  'shitsuke.meta': 'meta',
  'shitsuke.checklist': 'Checklist de auditoria 5S — corrija para reerguer o radar',
  'shitsuke.auditAria': 'Auditar e corrigir: {texto}',
  'shitsuke.audit': '🔍 Auditar agora',
  'shitsuke.done': 'feito',
  'shitsuke.sec': 'seg',

  // gameStore (mensagens locais de UI)
  'store.welcome':
    'Bem-vindo ao chão de fábrica! Sou o Mestre 5S. Vamos transformar esse caos em padrão — um senso de cada vez.',
  'store.rate': 'Calma! Esse ritmo não parece humano. 😅',
  'store.errStart': 'Não foi possível iniciar a partida. Tente novamente.',
  'store.errCmd': 'Erro ao enviar comando.',

  // Descritor de cada senso (o nome japonês é constante; só o descritor traduz)
  'senso.SEIRI': 'Utilização',
  'senso.SEITON': 'Ordenação',
  'senso.SEISO': 'Limpeza',
  'senso.SEIKETSU': 'Padronização',
  'senso.SHITSUKE': 'Disciplina',

  // Nome localizado das badges (a chave estável vem do servidor)
  'badge.zero_refugo': 'Zero Refugo',
  'badge.cacador_anomalias': 'Caçador de Anomalias',
  'badge.olho_aguia': 'Olho de Águia',
  'badge.sequencia_perfeita': 'Sequência Perfeita',
  'badge.mestre_sensos': 'Mestre dos Sensos',
} as const

export type TKey = keyof typeof pt

const en: Record<TKey, string> = {
  'start.alt': '5S Master welcoming you',
  'start.subtitle':
    'The Journey of the Senses. Turn a chaotic station into an exemplary 5S station — learning by doing, guided by the Master.',
  'start.beginAria': 'Start the 5S journey',
  'start.loading': 'Preparing the shop floor…',
  'start.begin': '▶ Start the journey',
  'start.tagline': 'Single-player · no sign-up · learn 5S in a few minutes',
  'start.langPt': 'Play in Portuguese',
  'start.langEn': 'Play in English',

  'game.phaseLabel': 'Phase {n} of 5',
  'game.advance': '➡ Advance phase',
  'game.finish': '🏆 Finish journey',

  'reset.trigger': '🔄 Restart',
  'reset.triggerAria': 'Restart the game from the first phase',
  'reset.dialogAria': 'Confirm restart',
  'reset.title': 'Restart from scratch?',
  'reset.body': "You'll lose all progress in this game and go back to the first phase, with new challenges.",
  'reset.cancel': 'Cancel',
  'reset.confirm': 'Yes, restart',

  'onb.title': 'How to play',
  'onb.b1': '🎯 Apply the 5 senses in order — each phase has a different action.',
  'onb.b2': '🖐️ Drag, fit, clean, and audit. You learn by doing, not memorizing.',
  'onb.b3': '📡 The 5S Radar shows your progress live; the Master guides you the whole time.',
  'onb.b4': "⚡ Every now and then comes the Master's Challenge — classify the situation by the right sense.",
  'onb.startAria': 'Got it, start playing',
  'onb.cta': "Let's go! 🚀",

  'hall.alt': '5S Master celebrating',
  'hall.tag': '5S Hall',
  'hall.scoreLine': '{mat} seal · 5S Score {s5} · {pts} pts',
  'hall.beforeTitle': '🏚️ Before',
  'hall.beforeText': 'Tools left lying around, scrap mixed in, oil on the floor, faded labels. No one could find anything.',
  'hall.afterTitle': '✨ After',
  'hall.afterText': 'Only the essentials, everything in its place, clean and inspected, the standard visible and sustained by habit.',
  'hall.badgesTitle': 'Badges earned',
  'hall.noBadges': 'No badges this time — play again and aim for gold!',
  'hall.share': '📤 Share certificate',
  'hall.playAgain': '🔄 Play again',
  'hall.shareText': 'I completed eKaizen 5S as {veredito} ({mat}) with a 5S Score of {s5}! 🏆',

  'intro.alt': '5S Master',
  'intro.next': 'Next ▶',
  'intro.start': 'Start phase ▶',
  'intro.p1.m1':
    "Welcome to the shop floor! I'm the 5S Master, your guide on this journey to master the 5S methodology. Let's transform this workplace together!",
  'intro.p1.m2':
    'The first pillar of the 5S methodology is SEIRI. It is based on separating everything that is necessary from what is not.',
  'intro.p1.m3':
    'Unnecessary items create obstacles and hide problems. Sort each item on the bench into: Keep, Red Tag, or Discard. Focus on the essentials!',
  'intro.p2.m1': 'SEIRI complete! Now comes SEITON — the Sense of Order.',
  'intro.p2.m2': 'The rule is simple: the more often it is used, the more accessible it should be. Organize!',
  'intro.p2.m3':
    'Each tool has an exact place on the shadow board. Look at the outlines and fit each item where it belongs.',
  'intro.p3.m1': 'Congrats on SEITON! Next phase: SEISO — the Sense of Cleaning.',
  'intro.p3.m2': 'Scrub each area to reveal the finding hidden under the dirt.',
  'intro.p3.m3': 'Not every finding is a problem: log the real anomalies and ignore the mundane ones.',
  'intro.p4.m1': 'SEISO complete! Welcome to SEIKETSU — the Sense of Standardization.',
  'intro.p4.m2': 'Photograph the standard to create the reference. Then the items will get shuffled.',
  'intro.p4.m3':
    'Compare each item with the photo: mark compliant if it is in place, deviation if it moved.',
  'intro.p5.m1': 'We have reached SHITSUKE — the Sense of Discipline. The most challenging phase!',
  'intro.p5.m2': 'Entropy never stops: the radar decays and, every 5s, a shock knocks down 2 sectors by 20%.',
  'intro.p5.m3': 'Audit nonstop and keep the average ≥ 50% for 30 continuous seconds to finish the journey!',

  'hud.score': '5S Score',
  'hud.points': 'Points',
  'hud.streak': 'Streak',
  'hud.progressAria': 'Phase progress',

  'mentor.alt': '5S Mentor ({mood})',

  'radar.aria': "5S Radar with each sense's score",

  'desafio.aria': "Master's Challenge",
  'desafio.title': "⚡ Master's Challenge",
  'desafio.prompt': 'Which sense solves this situation? Drag the card to the right sense.',
  'desafio.situacaoAria': 'Situation: {texto}',
  'desafio.classificarAria': 'Classify as {senso}',

  'seiri.zona.manter.t': 'Keep',
  'seiri.zona.manter.d': 'Necessary and in use',
  'seiri.zona.redtag.t': 'Red tag',
  'seiri.zona.redtag.d': 'Rare/valuable → storeroom',
  'seiri.zona.descartar.t': 'Discard',
  'seiri.zona.descartar.d': 'Scrap / no value',
  'seiri.bench': 'Workbench ({n} {w} to sort)',
  'seiri.item': 'item',
  'seiri.items': 'items',
  'seiri.itemAria': '{nome}. {dica}. Drag or use the buttons to classify.',
  'seiri.done': 'Workbench sorted! Move on to the next sense. ✅',

  'seiton.board': 'Shadow board — fit each item into its outline',
  'seiton.tray': 'Tray ({n})',
  'seiton.itemAria': '{nome}. Drag it to the matching outline.',
  'seiton.done': 'Everything in place! Move on to the next sense. ✅',

  'seiso.intro':
    'Scrub each surface and read the finding. Not everything is an anomaly: log what matters and ignore the rest.',
  'seiso.scrubAria': 'Scrub {nome}',
  'seiso.scrub': '🧽 Scrub',
  'seiso.logAria': 'Log anomaly on {nome}',
  'seiso.log': '🚩 Log',
  'seiso.ignoreAria': 'Ignore {nome}',
  'seiso.ignore': '🙈 Ignore',
  'seiso.res.logged': '✅ Anomaly logged',
  'seiso.res.ignoredOk': '✅ Rightly ignored',
  'seiso.res.falsePos': '⚠️ False positive',
  'seiso.res.missed': '❌ Anomaly missed',

  'seiketsu.memorize':
    "Memorize each item's position: this is the reference. Once you photograph it, they will get shuffled.",
  'seiketsu.snapshotBtn': '📸 Take a snapshot of the standard',
  'seiketsu.compare':
    'Compare the top row with the photo. Mark compliant (same position) or deviation (moved).',
  'seiketsu.refLabel': '📸 Standard (reference)',
  'seiketsu.conformeAria': '{nome} is in the standard position (compliant)',
  'seiketsu.conforme': '✓ Compliant',
  'seiketsu.desvioAria': '{nome} moved position (deviation)',
  'seiketsu.desvio': '⚠ Deviation',
  'seiketsu.resDesvio': 'Deviation',
  'seiketsu.resConforme': 'Compliant',

  'shitsuke.sustained': '✅ Standard sustained! You can finish the journey.',
  'shitsuke.keep': 'Keep the average ≥ {meta} until the timer hits zero. Shocks hit 2 sectors every 5s.',
  'shitsuke.avg': '5S average',
  'shitsuke.meta': 'target',
  'shitsuke.checklist': '5S audit checklist — fix items to raise the radar',
  'shitsuke.auditAria': 'Audit and fix: {texto}',
  'shitsuke.audit': '🔍 Audit now',
  'shitsuke.done': 'done',
  'shitsuke.sec': 'sec',

  'store.welcome':
    "Welcome to the shop floor! I'm the 5S Master. Let's turn this chaos into a standard — one sense at a time.",
  'store.rate': "Easy! That pace doesn't look human. 😅",
  'store.errStart': 'Could not start the game. Please try again.',
  'store.errCmd': 'Error sending command.',

  'senso.SEIRI': 'Sort',
  'senso.SEITON': 'Set in Order',
  'senso.SEISO': 'Shine',
  'senso.SEIKETSU': 'Standardize',
  'senso.SHITSUKE': 'Sustain',

  'badge.zero_refugo': 'Zero Scrap',
  'badge.cacador_anomalias': 'Anomaly Hunter',
  'badge.olho_aguia': 'Eagle Eye',
  'badge.sequencia_perfeita': 'Perfect Streak',
  'badge.mestre_sensos': 'Master of the Senses',
}

export const LANGS: Lang[] = ['pt', 'en']

export const STRINGS: Record<Lang, Record<TKey, string>> = { pt, en }

// Nome japonês de cada senso (nunca traduzido).
const SENSO_JP: Record<SensoKey, string> = {
  SEIRI: 'Seiri',
  SEITON: 'Seiton',
  SEISO: 'Seiso',
  SEIKETSU: 'Seiketsu',
  SHITSUKE: 'Shitsuke',
}

// Emoji de cada badge (a chave estável vem do servidor).
export const BADGE_EMOJI: Record<string, string> = {
  zero_refugo: '♻️',
  cacador_anomalias: '🔎',
  olho_aguia: '🦅',
  sequencia_perfeita: '🔥',
  mestre_sensos: '🏅',
}

export function t(lang: Lang, key: TKey, params?: Record<string, string | number>): string {
  let texto = STRINGS[lang][key]
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      texto = texto.replace(`{${k}}`, String(v))
    }
  }
  return texto
}

// Rótulo completo do senso: "Seiri · Utilização" (japonês + descritor localizado).
export function sensoNome(lang: Lang, key: SensoKey): string {
  return `${SENSO_JP[key]} · ${STRINGS[lang][`senso.${key}`]}`
}

// Nome localizado de uma badge a partir da sua chave estável.
export function badgeNome(lang: Lang, chave: string): string {
  const key = `badge.${chave}` as TKey
  return STRINGS[lang][key] ?? chave
}
