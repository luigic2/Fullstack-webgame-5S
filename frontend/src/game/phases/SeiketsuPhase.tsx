// SEIKETSU — Padronizar. Tire um snapshot do padrão; depois detecte os
// desvios sutis injetados (acertos vs falsos positivos contam no servidor).
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeiketsuPhase as SeiketsuData } from '../../types'
import { Button } from '../../ui/Button'

interface Props {
  fase: SeiketsuData
}

export function SeiketsuPhase({ fase }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)

  if (!fase.snapshot) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-8 text-center text-white">
        <span className="text-5xl">📸</span>
        <p className="max-w-sm text-white/80">
          Sem padrão não há melhoria. Fotografe o estado bom: ele vira a referência para enxergar
          qualquer desvio.
        </p>
        <Button onClick={() => void dispatch('seiketsu.snapshot', {})}>📸 Tirar snapshot do padrão</Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">
        Padrão fixado. Algo saiu do lugar? Marque cada ponto como <b>conforme</b> ou <b>desvio</b>.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fase.spots.map((spot) => (
          <motion.div
            key={spot.id}
            layout
            className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-lg"
          >
            <span className="text-4xl" aria-hidden="true">
              {spot.emoji}
            </span>
            <p className="mt-1 text-xs font-semibold text-marca-azul">{spot.nome}</p>
            {spot.avaliado === null ? (
              <div className="mt-2 flex gap-1">
                <button
                  onClick={() => void dispatch('seiketsu.avaliar', { spotId: spot.id, desvio: false })}
                  className="rounded bg-senso-seiso px-2 py-1 text-[11px] font-bold text-white"
                  aria-label={`${spot.nome} está conforme o padrão`}
                >
                  ✓ Conforme
                </button>
                <button
                  onClick={() => void dispatch('seiketsu.avaliar', { spotId: spot.id, desvio: true })}
                  className="rounded bg-senso-seiri px-2 py-1 text-[11px] font-bold text-white"
                  aria-label={`${spot.nome} é um desvio do padrão`}
                >
                  ⚠ Desvio
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs font-bold text-white/60">
                {spot.avaliado ? 'Marcado: desvio' : 'Marcado: conforme'}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
