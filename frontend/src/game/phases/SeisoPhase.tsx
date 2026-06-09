// SEISO — Limpar é inspecionar. Esfregue cada área; ao limpar, anomalias
// escondidas aparecem e precisam ser etiquetadas (limpeza ≠ etiqueta).
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeisoTile } from '../../types'

interface Props {
  tiles: SeisoTile[]
}

export function SeisoPhase({ tiles }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">
        Esfregue cada superfície. Ao limpar, inspecione: etiquete o que estava escondido.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            onLimpar={() => void dispatch('seiso.limpar', { tileId: tile.id })}
            onEtiquetar={() => void dispatch('seiso.etiquetar', { tileId: tile.id })}
          />
        ))}
      </div>
    </div>
  )
}

interface TileProps {
  tile: SeisoTile
  onLimpar: () => void
  onEtiquetar: () => void
}

function Tile({ tile, onLimpar, onEtiquetar }: TileProps): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-3 text-center shadow-lg">
      <span className="text-4xl" aria-hidden="true">
        {tile.emoji}
      </span>
      <p className="mt-1 text-xs font-semibold text-marca-azul">{tile.nome}</p>

      <AnimatePresence>
        {!tile.limpo && (
          <motion.button
            exit={{ opacity: 0, scale: 1.2 }}
            onClick={onLimpar}
            className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,#9ca3af,#9ca3af_6px,#6b7280_6px,#6b7280_12px)] text-sm font-bold text-white"
            aria-label={`Esfregar ${tile.nome}`}
          >
            🧽 Esfregar
          </motion.button>
        )}
      </AnimatePresence>

      {tile.limpo && tile.temAnomalia === true && !tile.etiquetada && (
        <motion.button
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          onClick={onEtiquetar}
          className="mt-2 w-full rounded-lg bg-marca-laranja px-2 py-1 text-xs font-bold text-white"
          aria-label={`Etiquetar anomalia em ${tile.nome}: ${tile.anomalia ?? ''}`}
        >
          🚩 {tile.anomalia}
        </motion.button>
      )}
      {tile.etiquetada && <p className="mt-2 text-xs font-bold text-senso-seiso">✅ Anomalia registrada</p>}
      {tile.limpo && tile.temAnomalia === false && (
        <p className="mt-2 text-xs font-semibold text-white/50">Limpo, sem anomalias</p>
      )}
    </div>
  )
}
