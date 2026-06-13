// Radar 5S pentagonal — gestão à vista. Cada eixo (0..100) anima suavemente
// via springs do Framer Motion conforme o estado do servidor muda.
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { t } from '../../i18n'
import { useGameStore } from '../../store/gameStore'
import type { SensoKey } from '../../types'
import { SENSO_ORDER } from '../../types'
import { SENSO_COR, SENSO_SIMBOLO } from '../sensoInfo'

const SIZE = 260
const C = SIZE / 2
const R = 96
const ANGLES = SENSO_ORDER.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5)

function ponto(valor: number, i: number): [number, number] {
  const raio = (Math.max(0, Math.min(100, valor)) / 100) * R
  return [C + raio * Math.cos(ANGLES[i] ?? 0), C + raio * Math.sin(ANGLES[i] ?? 0)]
}

function grade(escala: number): string {
  return ANGLES.map((a) => `${C + escala * R * Math.cos(a)},${C + escala * R * Math.sin(a)}`).join(' ')
}

interface Props {
  radar: Record<SensoKey, number>
}

export function Radar({ radar }: Props): JSX.Element {
  const lang = useGameStore((s) => s.lang)
  const springs = SENSO_ORDER.map((k) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- ordem fixa (5 eixos)
    useSpring(radar[k], { stiffness: 120, damping: 20 }),
  )
  useEffect(() => {
    SENSO_ORDER.forEach((k, i) => springs[i]?.set(radar[k]))
  }, [radar, springs])

  const points = useTransform(springs, (vals: number[]) =>
    vals.map((v, i) => ponto(v, i).join(',')).join(' '),
  )

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[300px]" role="img"
      aria-label={t(lang, 'radar.aria')}>
      {[0.25, 0.5, 0.75, 1].map((e) => (
        <polygon key={e} points={grade(e)} fill="none" stroke="rgba(255,255,255,0.18)" />
      ))}
      {ANGLES.map((a, i) => (
        <line key={i} x1={C} y1={C} x2={C + R * Math.cos(a)} y2={C + R * Math.sin(a)}
          stroke="rgba(255,255,255,0.18)" />
      ))}
      <motion.polygon points={points} fill="rgba(244,122,32,0.35)" stroke="#F47A20" strokeWidth={2} />
      {SENSO_ORDER.map((k, i) => {
        const [lx, ly] = ponto(118, i)
        return (
          <text key={k} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="700" fill={SENSO_COR[k]} aria-hidden="true">
            {SENSO_SIMBOLO[k]} {k}
          </text>
        )
      })}
    </svg>
  )
}
