// SEIKETSU — Padronizar. Tire um snapshot do padrão; os itens embaralham e
// você compara cada um com a foto de referência: conforme ou desvio de posição.
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeiketsuPhase as SeiketsuData, SeiketsuItem, SeiketsuSlot } from '../../types'
import { Button } from '../../ui/Button'

interface Props {
  fase: SeiketsuData
}

export function SeiketsuPhase({ fase }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)

  if (!fase.snapshot) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-6 text-center text-white">
        <p className="max-w-sm text-white/80">
          Memorize a posição de cada item: esta é a referência. Ao fotografar, eles vão se embaralhar.
        </p>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {fase.atual.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
        <Button onClick={() => void dispatch('seiketsu.snapshot', {})}>📸 Tirar snapshot do padrão</Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">
        Compare a fileira de cima com a foto. Marque <b>conforme</b> (mesma posição) ou <b>desvio</b> (mudou de lugar).
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fase.atual.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            onAvaliar={(desvio) => void dispatch('seiketsu.avaliar', { spotId: slot.id, desvio })}
          />
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-marca-laranja">📸 Padrão (referência)</p>
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-marca-azul/30 p-2 sm:grid-cols-3">
        {fase.referencia.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: SeiketsuItem }): JSX.Element {
  return (
    <motion.div layout className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-lg">
      <span className="text-4xl" aria-hidden="true">
        {item.emoji}
      </span>
      <p className="mt-1 text-xs font-semibold text-marca-azul">{item.nome}</p>
    </motion.div>
  )
}

interface SlotProps {
  slot: SeiketsuSlot
  onAvaliar: (desvio: boolean) => void
}

function SlotCard({ slot, onAvaliar }: SlotProps): JSX.Element {
  return (
    <motion.div layout className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-lg">
      <span className="text-4xl" aria-hidden="true">
        {slot.emoji}
      </span>
      <p className="mt-1 text-xs font-semibold text-marca-azul">{slot.nome}</p>
      {slot.avaliado === null ? (
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => onAvaliar(false)}
            className="rounded bg-senso-seiso px-2 py-1 text-[11px] font-bold text-white"
            aria-label={`${slot.nome} está na posição do padrão (conforme)`}
          >
            ✓ Conforme
          </button>
          <button
            onClick={() => onAvaliar(true)}
            className="rounded bg-senso-seiri px-2 py-1 text-[11px] font-bold text-white"
            aria-label={`${slot.nome} mudou de posição (desvio)`}
          >
            ⚠ Desvio
          </button>
        </div>
      ) : (
        <p className={`mt-2 text-xs font-bold ${slot.acertou ? 'text-senso-seiso' : 'text-red-500'}`}>
          {slot.acertou ? '✅ ' : '❌ '}
          {slot.avaliado ? 'Desvio' : 'Conforme'}
        </p>
      )}
    </motion.div>
  )
}
