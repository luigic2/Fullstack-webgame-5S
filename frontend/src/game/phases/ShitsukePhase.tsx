// SHITSUKE — Sustentar sob pressão. A entropia decai o radar e, a cada 5s, um
// choque derruba 2 setores. Mantenha a média ≥ meta por 30s contínuos: o
// cronômetro (autoritativo no servidor) é só exibido/suavizado aqui.
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { ShitsukeItem } from '../../types'
import { SENSO_COR } from '../sensoInfo'

interface Props {
  itens: ShitsukeItem[]
}

export function ShitsukePhase({ itens }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const score5s = useGameStore((s) => s.state?.score5s ?? 0)
  const desafio = useGameStore((s) => s.state?.shitsukeDesafio)

  const meta = desafio?.metaMedia ?? 50
  const duracao = desafio?.duracaoSeg ?? 30
  const sustentado = desafio?.sustentado ?? false
  const restanteServidor = desafio?.restanteSeg ?? duracao
  const acimaMeta = score5s >= meta

  // Conta para baixo localmente entre os pushes (~3s) e re-sincroniza a cada
  // novo estado do servidor. Só desce enquanto a média está acima da meta.
  const [restante, setRestante] = useState(restanteServidor)
  useEffect(() => setRestante(restanteServidor), [restanteServidor])
  useEffect(() => {
    if (sustentado || !acimaMeta) return
    const id = setInterval(() => setRestante((r) => Math.max(0, r - 0.1)), 100)
    return () => clearInterval(id)
  }, [sustentado, acimaMeta, restanteServidor])

  const mostrado = sustentado ? 0 : acimaMeta ? restante : duracao

  return (
    <div className="space-y-4">
      <motion.div
        animate={{ borderColor: sustentado ? '#3FA34D' : acimaMeta ? '#C9A227' : '#E4572E' }}
        className="flex items-center gap-4 rounded-2xl border-2 bg-white/10 p-4 text-white"
      >
        <Cronometro segundos={mostrado} total={duracao} sustentado={sustentado} acimaMeta={acimaMeta} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/80">
            {sustentado
              ? '✅ Padrão sustentado! Pode concluir a jornada.'
              : `Mantenha a média ≥ ${meta} até o cronômetro zerar. Choques atingem 2 setores a cada 5s.`}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">{score5s}</span>
            <span className="text-xs text-white/60">média 5S · meta {meta}</span>
          </div>
          <div className="relative mt-1 h-3 w-full overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full"
              style={{ background: acimaMeta ? '#3FA34D' : '#E4572E' }}
              animate={{ width: `${Math.max(0, Math.min(100, score5s))}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
            <span className="absolute top-0 h-full w-0.5 bg-white/70" style={{ left: `${meta}%` }} aria-hidden="true" />
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="mb-3 text-sm font-semibold text-white/80">Checklist de auditoria 5S — corrija para reerguer o radar</p>
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

interface CronProps {
  segundos: number
  total: number
  sustentado: boolean
  acimaMeta: boolean
}

function Cronometro({ segundos, total, sustentado, acimaMeta }: CronProps): JSX.Element {
  const frac = total > 0 ? Math.max(0, Math.min(1, segundos / total)) : 0
  const raio = 34
  const circ = 2 * Math.PI * raio
  const cor = sustentado ? '#3FA34D' : acimaMeta ? '#C9A227' : '#9ca3af'
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={raio} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - frac) }}
          transition={{ ease: 'linear', duration: 0.12 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{sustentado ? '✓' : Math.ceil(segundos)}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-white/60">
          {sustentado ? 'feito' : 'seg'}
        </span>
      </div>
    </div>
  )
}
