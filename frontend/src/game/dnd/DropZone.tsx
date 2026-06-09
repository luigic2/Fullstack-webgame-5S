// Zona de soltura. Marca-se com data-zone para o Draggable detectar via
// elementFromPoint. Destaca no hover de arraste.
import type { ReactNode } from 'react'

interface Props {
  id: string
  titulo: string
  descricao: string
  cor: string
  children?: ReactNode
}

export function DropZone({ id, titulo, descricao, cor, children }: Props): JSX.Element {
  return (
    <div
      data-zone={id}
      className="flex min-h-[150px] flex-1 flex-col rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-3 transition hover:border-white/70 hover:bg-white/10"
      style={{ boxShadow: `inset 0 -3px 0 ${cor}` }}
    >
      <div className="pointer-events-none mb-2">
        <p className="font-bold text-white">{titulo}</p>
        <p className="text-xs text-white/70">{descricao}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
