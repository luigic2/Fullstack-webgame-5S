// Item arrastável reutilizável (SEIRI, SEITON, Desafio). Arrasta com física,
// dá snap de volta à origem e detecta a zona de soltura via elementsFromPoint.
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
        // elementsFromPoint (plural) retorna toda a pilha de elementos naquela
        // posição, do topo ao fundo — atravessa automaticamente o item arrastado
        // e seus filhos até encontrar o [data-zone] do slot abaixo.
        const pilha = document.elementsFromPoint(c.x, c.y)
        let zona: Element | null = null
        for (const el of pilha) {
          const z = el.closest('[data-zone]')
          if (z) { zona = z; break }
        }
        const zoneId = zona?.getAttribute('data-zone') ?? null
        if (zoneId !== null) onDrop(zoneId)
      }}
      className={`cursor-grab touch-none select-none ${disabled ? 'opacity-50' : ''}`}
    >
      {children}
    </motion.div>
  )
}
