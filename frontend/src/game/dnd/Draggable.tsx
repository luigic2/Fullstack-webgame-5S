// Item arrastável reutilizável (SEIRI, SEITON, Desafio). Arrasta com física,
// dá snap de volta à origem e detecta a zona de soltura via elementFromPoint.
// Acessível: também aceita seleção por teclado/botão (ver onDrop nas fases).
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onDrop: (zoneId: string) => void
  ariaLabel: string
  disabled?: boolean
}

function clientCoords(e: MouseEvent | TouchEvent | PointerEvent): { x: number; y: number } | null {
  if ('clientX' in e) return { x: e.clientX, y: e.clientY }
  const toque = e.changedTouches[0]
  return toque ? { x: toque.clientX, y: toque.clientY } : null
}

export function Draggable({ children, onDrop, ariaLabel, disabled = false }: Props): JSX.Element {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      drag={!disabled}
      dragSnapToOrigin
      whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      dragElastic={0.2}
      onDragEnd={(event) => {
        const c = clientCoords(event)
        if (c === null) return
        const alvo = document.elementFromPoint(c.x, c.y)
        const zona = alvo?.closest('[data-zone]')
        const zoneId = zona?.getAttribute('data-zone')
        if (zoneId !== null && zoneId !== undefined) onDrop(zoneId)
      }}
      className={`cursor-grab touch-none select-none ${disabled ? 'opacity-50' : ''}`}
    >
      {children}
    </motion.div>
  )
}
