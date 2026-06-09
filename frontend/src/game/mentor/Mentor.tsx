// O Mestre 5S: mascote-guia. Troca de pose conforme o estado emocional e
// fala em balão. Entra com animação (Framer Motion).
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { MENTOR_POSE } from '../sensoInfo'

export function Mentor(): JSX.Element {
  const mentor = useGameStore((s) => s.mentor)

  return (
    <div className="flex items-end gap-3" aria-live="polite">
      <motion.img
        key={mentor.mood}
        src={MENTOR_POSE[mentor.mood]}
        alt={`Mentor 5S (${mentor.mood})`}
        className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-xl ring-2 ring-white/30 sm:h-28 sm:w-28"
        initial={{ scale: 0.7, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={mentor.mensagem}
          className="relative max-w-md rounded-2xl bg-white px-4 py-3 text-sm text-marca-azul shadow-xl sm:text-base"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span
            className="absolute -left-2 bottom-3 h-4 w-4 rotate-45 bg-white"
            aria-hidden="true"
          />
          {mentor.mensagem}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
