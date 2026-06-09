// Painel de status sempre visível: 5S Score, selo, streak e trilha das 5 fases.
import { motion } from 'framer-motion'
import type { GameState } from '../types'
import { SENSO_ORDER } from '../types'
import { SENSO_COR, SENSO_SIMBOLO, sensoFromPhase } from './sensoInfo'

interface Props {
  state: GameState
}

export function Hud({ state }: Props): JSX.Element {
  const atual = sensoFromPhase(state.currentPhase)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white">
        <Metric label="5S Score" valor={`${state.score5s}`} sufixo={`· ${state.maturidade}`} />
        <Metric label="Pontos" valor={`${state.score}`} />
        <Metric label="Streak" valor={`🔥 ${state.streak}`} />
      </div>
      <ol className="flex items-center justify-between gap-1" aria-label="Progresso das fases">
        {SENSO_ORDER.map((k) => {
          const ativo = k === atual
          const liberado = state.unlocked.includes(k)
          return (
            <li key={k} className="flex flex-1 flex-col items-center">
              <motion.div
                animate={{ scale: ativo ? 1.15 : 1 }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background: liberado || ativo ? SENSO_COR[k] : 'rgba(255,255,255,0.15)',
                  boxShadow: ativo ? `0 0 0 3px white` : 'none',
                }}
                title={k}
              >
                {SENSO_SIMBOLO[k]}
              </motion.div>
              <span className="mt-1 hidden text-[10px] font-semibold text-white/70 sm:block">{k}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Metric({ label, valor, sufixo }: { label: string; valor: string; sufixo?: string }): JSX.Element {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
      <p className="text-lg font-extrabold">
        {valor} {sufixo !== undefined && <span className="text-xs font-semibold text-white/70">{sufixo}</span>}
      </p>
    </div>
  )
}
