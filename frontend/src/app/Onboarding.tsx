// Onboarding guiado pelo Mentor — explica o objetivo em segundos. Desativável.
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function Onboarding(): JSX.Element {
  const dismiss = useGameStore((s) => s.dismissOnboarding)
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Como jogar"
    >
      <motion.div
        className="max-w-lg rounded-3xl bg-white p-6 text-marca-azul shadow-2xl"
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
      >
        <div className="mb-3 flex items-center gap-3">
          <img src="/mentor/mentor-pergunta.png" alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <h2 className="text-2xl font-extrabold">Como jogar</h2>
        </div>
        <ul className="space-y-2 text-sm">
          <li>🎯 Aplique os <b>5 sensos na ordem</b> — cada fase tem uma ação diferente.</li>
          <li>🖐️ <b>Arraste, encaixe, limpe e audite</b>. Aprende-se fazendo, não decorando.</li>
          <li>📡 O <b>Radar 5S</b> mostra seu progresso ao vivo; o Mestre te guia o tempo todo.</li>
          <li>⚡ De vez em quando vem o <b>Desafio do Mestre</b> — classifique a situação pelo senso certo.</li>
        </ul>
        <div className="mt-5 flex justify-end">
          <Button onClick={dismiss} aria-label="Entendi, começar a jogar">
            Bora! 🚀
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
