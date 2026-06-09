import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function StartScreen(): JSX.Element {
  const start = useGameStore((s) => s.start)
  const loading = useGameStore((s) => s.loading)
  const error = useGameStore((s) => s.error)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <motion.img
        src="/mentor/mentor-boasvindas.png"
        alt="Mestre 5S dando boas-vindas"
        className="mb-6 h-40 w-40 rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      />
      <motion.h1
        className="text-4xl font-extrabold sm:text-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        eKaizen 5S
      </motion.h1>
      <p className="mt-2 max-w-md text-lg text-white/80">
        A Jornada dos Sensos. Transforme uma estação caótica numa estação 5S exemplar — aprendendo na
        prática, guiado pelo Mestre.
      </p>
      <div className="mt-8">
        <Button onClick={() => void start()} disabled={loading} aria-label="Começar a jornada 5S">
          {loading ? 'Preparando o chão de fábrica…' : '▶ Começar a jornada'}
        </Button>
      </div>
      {error !== null && <p className="mt-4 text-marca-laranja">{error}</p>}
      <p className="mt-10 text-xs text-white/50">
        Single-player · sem cadastro · aprenda 5S em poucos minutos
      </p>
    </main>
  )
}
