// SEIRI — Separar. Arraste cada item da bancada para Manter / Etiqueta
// vermelha / Descartar. O destino correto é decidido no servidor.
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeiriItem } from '../../types'
import { Draggable } from '../dnd/Draggable'
import { DropZone } from '../dnd/DropZone'

const ZONAS: { id: string; titulo: string; descricao: string; cor: string }[] = [
  { id: 'manter', titulo: 'Manter', descricao: 'Necessário e em uso', cor: '#3FA34D' },
  { id: 'red_tag', titulo: 'Etiqueta vermelha', descricao: 'Raro/valioso → almoxarifado', cor: '#C9A227' },
  { id: 'descartar', titulo: 'Descartar', descricao: 'Refugo / sem valor', cor: '#E4572E' },
]

interface Props {
  itens: SeiriItem[]
}

export function SeiriPhase({ itens }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const pendentes = itens.filter((i) => i.resolvido === null)

  const classificar = (item: SeiriItem, zona: string): void => {
    void dispatch('seiri.classificar', { itemId: item.id, zona })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/10 p-4">
        <p className="mb-3 text-sm font-semibold text-white/80">
          Bancada ({pendentes.length} {pendentes.length === 1 ? 'item' : 'itens'} para separar)
        </p>
        <div className="flex min-h-[88px] flex-wrap gap-3">
          <AnimatePresence>
            {pendentes.map((item) => (
              <motion.div key={item.id} layout exit={{ scale: 0, opacity: 0 }}>
                <Draggable
                  ariaLabel={`${item.nome}. ${item.dica}. Arraste ou use os botões para classificar.`}
                  onDrop={(zona) => classificar(item, zona)}
                >
                  <ItemCard item={item} />
                </Draggable>
                <div className="mt-1 flex justify-center gap-1">
                  {ZONAS.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => classificar(item, z.id)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: z.cor }}
                      aria-label={`Mandar ${item.nome} para ${z.titulo}`}
                    >
                      {z.titulo.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {pendentes.length === 0 && (
            <p className="self-center text-white/70">Bancada separada! Avance para o próximo senso. ✅</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {ZONAS.map((z) => (
          <DropZone key={z.id} id={z.id} titulo={z.titulo} descricao={z.descricao} cor={z.cor} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: SeiriItem }): JSX.Element {
  return (
    <div className="flex w-28 flex-col items-center rounded-xl bg-white p-2 text-center shadow-lg">
      <span className="text-3xl" aria-hidden="true">
        {item.emoji}
      </span>
      <span className="mt-1 text-xs font-semibold text-marca-azul">{item.nome}</span>
    </div>
  )
}
