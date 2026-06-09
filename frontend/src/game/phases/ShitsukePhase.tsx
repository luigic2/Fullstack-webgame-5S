// SHITSUKE — Sustentar. O 5S Score decai com o tempo real (entropia). Faça
// auditorias periódicas para manter o nível alto. Quem abandona, perde tudo.
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { ShitsukeItem } from '../../types'
import { SENSO_COR } from '../sensoInfo'

interface Props {
  itens: ShitsukeItem[]
}

export function ShitsukePhase({ itens }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const score5s = useGameStore((s) => s.state?.score5s ?? 0)
  const ok = score5s >= 60

  return (
    <div className="space-y-4">
      <motion.div
        animate={{ borderColor: ok ? '#3FA34D' : '#E4572E' }}
        className="rounded-2xl border-2 bg-white/10 p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white/80">
            ⏳ A entropia corrói o 5S em tempo real — sustente acima de 60.
          </p>
          <span className="text-2xl font-extrabold">{score5s}</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full"
            style={{ background: ok ? '#3FA34D' : '#E4572E' }}
            animate={{ width: `${Math.max(0, Math.min(100, score5s))}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </motion.div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="mb-3 text-sm font-semibold text-white/80">Checklist de auditoria 5S</p>
        <ul className="space-y-2">
          {itens.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
              style={{ boxShadow: `inset 4px 0 0 ${SENSO_COR[item.senso]}` }}
            >
              <span className="text-sm font-semibold text-marca-azul">{item.texto}</span>
              <button
                onClick={() => void dispatch('shitsuke.corrigir', { itemId: item.id })}
                className="shrink-0 rounded-lg bg-marca-azul px-3 py-1 text-xs font-bold text-white hover:brightness-125"
                aria-label={`Auditar e corrigir: ${item.texto}`}
              >
                🔍 Auditar agora
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
