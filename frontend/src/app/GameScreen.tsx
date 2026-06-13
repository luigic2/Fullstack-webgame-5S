import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Hud } from '../game/Hud'
import { PhaseIntroOverlay } from '../game/PhaseIntroOverlay'
import { DesafioModal } from '../game/desafio/DesafioModal'
import { Mentor } from '../game/mentor/Mentor'
import { PhaseRouter } from '../game/phases/PhaseRouter'
import { Radar } from '../game/radar/Radar'
import { sensoFromPhase } from '../game/sensoInfo'
import { sensoNome, t } from '../i18n'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { Button } from '../ui/Button'
import { Onboarding } from './Onboarding'
import { ResetButton } from './ResetButton'

interface Props {
  state: GameState
}

export function GameScreen({ state }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const onboarding = useGameStore((s) => s.onboarding)
  const lang = useGameStore((s) => s.lang)
  const senso = sensoFromPhase(state.currentPhase)
  const ultimaFase = state.currentPhase === 5
  const concluirBloqueado = ultimaFase && !state.shitsukeDesafio.sustentado

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
        <ResetButton />
      </header>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="flex justify-center rounded-2xl bg-white/5 p-3" style={{ backgroundColor: '#ffffff5c' }}>
            <Radar radar={state.radar} />
          </div>
          <Hud state={state} />
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl bg-marca-azul/40 p-3 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-marca-laranja">
              {t(lang, 'game.phaseLabel', { n: state.currentPhase })}
            </p>
            <h2 className="text-lg font-extrabold">{sensoNome(lang, senso)}</h2>
          </div>
          <PhaseRouter state={state} />
          <div className="flex justify-end">
            <Button onClick={() => void dispatch('fase.avancar')} disabled={concluirBloqueado}>
              {ultimaFase ? t(lang, 'game.finish') : t(lang, 'game.advance')}
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
            onDone={() => {
              setIntroPhase(null)
              if (introPhase === 5) void dispatch('shitsuke.iniciar')
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
