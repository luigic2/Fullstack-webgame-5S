// Overlay de introdução de fase: bloqueia a tela, apresenta o Mestre 5S
// e avança mensagem a mensagem até o jogador estar pronto para começar.
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { MentorMood } from '../types'
import { MENTOR_POSE, SENSO_COR, SENSO_NOME, SENSO_SIMBOLO, sensoFromPhase } from './sensoInfo'

interface IntroData {
  pose: MentorMood
  mensagens: string[]
}

const INTROS: Partial<Record<number, IntroData>> = {
  1: {
    pose: 'boasvindas',
    mensagens: [
      'Bem-vindo ao chão de fábrica! Sou o Mestre 5S, seu guia nessa jornada para dominar a metodologia 5S, vamos transformar esse ambiente de trabalho!.',
      'O Primeiro Pilar da metodologia 5S é a SEIRI. ela se baseia na ideia da separação de tudo que é necessario daquilo que não é',
      'Itens desnecessários criam obstáculos e escondem problemas. Separe cada item da bancada entre: Manter, Etiqueta Vermelha ou Descartar. Foque no essencial!',
    ],
  },
  2: {
    pose: 'pergunta',
    mensagens: [
      'SEIRI concluído! Agora é o SEITON — Senso de Ordenação.',
      'O critério é simples: quanto mais usado, mais acessível deve estar. Organize!',
      'Cada ferramenta tem um lugar exato no shadow board. Veja os contornos e encaixe cada item onde ele pertence.',
    ],
  },
  3: {
    pose: 'aprova',
    mensagens: [
      'Parabéns pelo SEITON! Próxima fase: SEISO — Senso de Limpeza.',
      'Limpe cada área para revelar o que está escondido sob a sujeira.',
      'Sujeira e anomalia são coisas diferentes. Encontrou uma anomalia real? Etiquete-a!',
    ],
  },
  4: {
    pose: 'pergunta',
    mensagens: [
      'SEISO concluído! Bem-vindo ao SEIKETSU — Senso de Padronização.',
      'Fotografe o padrão estabelecido e depois encontre os desvios que vou introduzir.',
      'Cuidado com falsos positivos: marcar algo correto como desvio prejudica sua pontuação.',
    ],
  },
  5: {
    pose: 'comemora',
    mensagens: [
      'Chegamos ao SHITSUKE — o Senso de Disciplina. A fase mais desafiadora!',
      'A entropia nunca para: seu radar vai decaindo com o tempo.',
      'Audite, corrija as inconformidades e sustente o padrão. Mantenha o 5S Score acima de 60!',
    ],
  },
}

interface Props {
  phase: number
  onDone: () => void
}

export function PhaseIntroOverlay({ phase, onDone }: Props): JSX.Element {
  const [idx, setIdx] = useState(0)
  const data = INTROS[phase]
  if (!data) return <></>

  const senso = sensoFromPhase(phase)
  const isLast = idx === data.mensagens.length - 1

  const handleNext = (): void => {
    if (isLast) {
      onDone()
    } else {
      setIdx((i) => i + 1)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/75 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-full px-6 py-2 text-base font-extrabold text-white shadow-lg"
        style={{ backgroundColor: SENSO_COR[senso] }}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {SENSO_SIMBOLO[senso]} {SENSO_NOME[senso]}
      </motion.div>

      <div className="flex items-end gap-4">
        <motion.img
          src={MENTOR_POSE[data.pose]}
          alt="Mestre 5S"
          className="h-36 w-36 shrink-0 rounded-2xl object-cover shadow-2xl ring-4 ring-white/30"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.12 }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="relative max-w-xs rounded-2xl bg-white p-5 text-marca-azul shadow-2xl sm:max-w-sm"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <span className="absolute -left-2 bottom-6 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
            <p className="text-base font-medium leading-relaxed">{data.mensagens[idx]}</p>
            <p className="mt-3 text-right text-xs text-gray-400">
              {idx + 1} / {data.mensagens.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        className="rounded-xl bg-marca-laranja px-8 py-3 font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-95"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleNext}
      >
        {isLast ? 'Começar fase ▶' : 'Avançar ▶'}
      </motion.button>
    </motion.div>
  )
}
