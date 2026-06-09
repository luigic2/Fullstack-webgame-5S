import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Hud } from '../game/Hud'
import { PhaseIntroOverlay } from '../game/PhaseIntroOverlay'
import { DesafioModal } from '../game/desafio/DesafioModal'
import { Mentor } from '../game/mentor/Mentor'
import { PhaseRouter } from '../game/phases/PhaseRouter'
import { Radar } from '../game/radar/Radar'
import { SENSO_NOME, sensoFromPhase } from '../game/sensoInfo'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { Button } from '../ui/Button'
import { Onboarding } from './Onboarding'

interface Props {
  state: GameState
}

export function GameScreen({ state }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const daltonico = useGameStore((s) => s.daltonico)
  const toggleDaltonico = useGameStore((s) => s.toggleDaltonico)
  const onboarding = useGameStore((s) => s.onboarding)
  const senso = sensoFromPhase(state.currentPhase)
  const ultimaFase = state.currentPhase === 5

  const [introPhase, setIntroPhase] = useState<number | null>(null)
  const prevPhase = useRef<number | null>(null)

  useEffect(() => {
    if (state.currentPhase !== prevPhase.current) {
      prevPhase.current = state.currentPhase
      setIntroPhase(state.currentPhase)
    }
  }, [state.currentPhase])

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <header className="mb-4 flex items-center justify-between text-white">
        <h1 className="text-xl font-extrabold">eKaizen 5S</h1>
        <button
          onClick={toggleDaltonico}
          aria-pressed={daltonico}
          className="rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10"
        >
          {daltonico ? '🎨 Modo daltônico: ON' : '🎨 Modo daltônico'}
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="flex justify-center rounded-2xl bg-white/5 p-3">
            <Radar radar={state.radar} />
          </div>
          <Hud state={state} />
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl bg-marca-azul/40 p-3 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-marca-laranja">
              Fase {state.currentPhase} de 5
            </p>
            <h2 className="text-lg font-extrabold">{SENSO_NOME[senso]}</h2>
          </div>
          <PhaseRouter state={state} />
          <div className="flex justify-end">
            <Button onClick={() => void dispatch('fase.avancar')}>
              {ultimaFase ? '🏆 Concluir jornada' : '➡ Avançar fase'}
            </Button>
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <Mentor />
        </div>
      </div>

      <AnimatePresence>
        {state.desafio !== null && !state.desafio.resolvido && <DesafioModal desafio={state.desafio} />}
      </AnimatePresence>
      <AnimatePresence>{onboarding && <Onboarding />}</AnimatePresence>

      <AnimatePresence>
        {introPhase !== null && !onboarding && (
          <PhaseIntroOverlay
            key={introPhase}
            phase={introPhase}
            onDone={() => setIntroPhase(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
