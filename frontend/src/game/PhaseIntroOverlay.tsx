// Overlay de introdução de fase: bloqueia a tela, apresenta o Mestre 5S
// e avança mensagem a mensagem até o jogador estar pronto para começar.
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { TKey } from '../i18n'
import { sensoNome, t } from '../i18n'
import { useGameStore } from '../store/gameStore'
import type { MentorMood } from '../types'
import { MENTOR_POSE, SENSO_COR, SENSO_SIMBOLO, sensoFromPhase } from './sensoInfo'

// Pose do Mestre por fase. As mensagens vêm do i18n (intro.p{fase}.m{1..3}).
const POSES: Partial<Record<number, MentorMood>> = {
  1: 'boasvindas',
  2: 'pergunta',
  3: 'aprova',
  4: 'pergunta',
  5: 'comemora',
}

interface Props {
  phase: number
  onDone: () => void
}

export function PhaseIntroOverlay({ phase, onDone }: Props): JSX.Element {
  const lang = useGameStore((s) => s.lang)
  const [idx, setIdx] = useState(0)
  const pose = POSES[phase]
  if (pose === undefined) return <></>

  const mensagens = [1, 2, 3].map((m) => t(lang, `intro.p${phase}.m${m}` as TKey))
  const senso = sensoFromPhase(phase)
  const isLast = idx === mensagens.length - 1

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
        {SENSO_SIMBOLO[senso]} {sensoNome(lang, senso)}
      </motion.div>

      <div className="flex items-end gap-4">
        <motion.img
          src={MENTOR_POSE[pose]}
          alt={t(lang, 'intro.alt')}
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
            <p className="text-base font-medium leading-relaxed">{mensagens[idx]}</p>
            <p className="mt-3 text-right text-xs text-gray-400">
              {idx + 1} / {mensagens.length}
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
        {isLast ? t(lang, 'intro.start') : t(lang, 'intro.next')}
      </motion.button>
    </motion.div>
  )
}
