// SEITON — Ordenar. Encaixe cada ferramenta no contorno (shadow board) certo.
// O servidor pontua a posição correta.
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeitonItem } from '../../types'
import { Draggable } from '../dnd/Draggable'

interface Props {
  itens: SeitonItem[]
}

export function SeitonPhase({ itens }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const slots = [...itens].sort((a, b) => a.slot.localeCompare(b.slot))
  const naBandeja = itens.filter((i) => i.encaixadoEm === null)

  const encaixar = (item: SeitonItem, slot: string): void => {
    void dispatch('seiton.encaixar', { itemId: item.id, slot })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/10 p-4">
        <p className="mb-3 text-sm font-semibold text-white/80">Shadow board — encaixe cada item no seu contorno</p>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((alvo) => {
            const ocupante = itens.find((i) => i.encaixadoEm === alvo.slot)
            const certo = ocupante !== undefined && ocupante.slot === alvo.slot
            return (
              <div
                key={alvo.slot}
                data-zone={alvo.slot}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/40 bg-white/5 p-2 transition hover:border-white"
              >
                {ocupante === undefined ? (
                  <span className="text-4xl opacity-25 grayscale" aria-hidden="true">
                    {alvo.emoji}
                  </span>
                ) : (
                  <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-center">
                    <span className="text-4xl" aria-hidden="true">
                      {certo ? ocupante.emoji : alvo.emoji}
                    </span>
                    <span className="block text-lg">{certo ? '✅' : ''}</span>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="mb-3 text-sm font-semibold text-white/80">Bandeja ({naBandeja.length})</p>
        <div className="flex min-h-[80px] flex-wrap gap-3">
          {naBandeja.map((item) => (
            <Draggable
              key={item.id}
              ariaLabel={`${item.nome}. Arraste para o contorno correspondente.`}
              onDrop={(slot) => encaixar(item, slot)}
            >
              <div className="flex w-24 flex-col items-center rounded-xl bg-white p-2 text-center shadow-lg">
                <span className="text-3xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="mt-1 text-xs font-semibold text-marca-azul">{item.nome}</span>
              </div>
            </Draggable>
          ))}
          {naBandeja.length === 0 && (
            <p className="self-center text-white/70">Tudo no lugar! Avance para o próximo senso. ✅</p>
          )}
        </div>
      </div>
    </div>
  )
}
