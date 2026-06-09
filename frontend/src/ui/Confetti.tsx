import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  ativo: boolean
  onDone?: () => void
}

interface Particula {
  id: number
  x0: number
  y0: number
  dx: number
  dy: number
  cor: string
  largura: number
  altura: number
  rotacao: number
  duracao: number
}

const CORES = ['#F97316', '#1E3A5F', '#10B981', '#FBBF24', '#EF4444', '#8B5CF6', '#EC4899']

function gerarParticulas(n: number): Particula[] {
  return Array.from({ length: n }, (_, i) => {
    const angulo = (Math.random() * 2 - 1) * Math.PI
    const dist = 100 + Math.random() * 220
    return {
      id: i,
      x0: 42 + Math.random() * 16,
      y0: 35 + Math.random() * 20,
      dx: Math.cos(angulo) * dist,
      dy: Math.sin(angulo) * dist - 60,
      cor: CORES[i % CORES.length],
      largura: 8 + Math.random() * 10,
      altura: 8 + Math.random() * 10,
      rotacao: (Math.random() - 0.5) * 720,
      duracao: 1.6 + Math.random() * 0.8,
    }
  })
}

export function Confetti({ ativo, onDone }: Props): JSX.Element {
  const [particulas, setParticulas] = useState<Particula[]>([])

  useEffect(() => {
    if (!ativo) return
    setParticulas(gerarParticulas(50))
    const tid = setTimeout(() => {
      setParticulas([])
      onDone?.()
    }, 2800)
    return () => clearTimeout(tid)
  }, [ativo, onDone])

  if (particulas.length === 0) return <></>

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x0}%`,
            top: `${p.y0}%`,
            width: p.largura,
            height: p.altura,
            backgroundColor: p.cor,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, rotate: p.rotacao, opacity: 0, scale: 0.2 }}
          transition={{ duration: p.duracao, ease: 'easeOut' }}
        />
      ))}
    </div>,
    document.body,
  )
}
