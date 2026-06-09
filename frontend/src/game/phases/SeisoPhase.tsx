// SEISO — Limpar é inspecionar. Esfregue cada área para revelar o achado e,
// com critério, decida: registrar a anomalia ou ignorar (limpeza ≠ etiqueta).
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
        Esfregue cada superfície e leia o achado. Nem tudo é anomalia: registre o que importa e ignore o resto.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            onLimpar={() => void dispatch('seiso.limpar', { tileId: tile.id })}
            onDecidir={(decisao) => void dispatch('seiso.decidir', { tileId: tile.id, decisao })}
          />
        ))}
      </div>
    </div>
  )
}

interface TileProps {
  tile: SeisoTile
  onLimpar: () => void
  onDecidir: (decisao: 'registrar' | 'ignorar') => void
}

function Tile({ tile, onLimpar, onDecidir }: TileProps): JSX.Element {
  const decidido = tile.decisao !== null
  return (
    <div className="relative flex min-h-[160px] flex-col overflow-hidden rounded-xl bg-white p-3 text-center shadow-lg">
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

      {tile.limpo && tile.descricao && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 rounded-lg bg-marca-azul/5 px-2 py-1 text-[11px] font-medium italic text-marca-azul"
        >
          “{tile.descricao}”
        </motion.p>
      )}

      {tile.limpo && !decidido && (
        <div className="mt-auto flex gap-1 pt-2">
          <button
            onClick={() => onDecidir('registrar')}
            className="flex-1 rounded-lg bg-marca-laranja px-1 py-1.5 text-[11px] font-bold text-white"
            aria-label={`Registrar anomalia em ${tile.nome}`}
          >
            🚩 Registrar
          </button>
          <button
            onClick={() => onDecidir('ignorar')}
            className="flex-1 rounded-lg bg-gray-200 px-1 py-1.5 text-[11px] font-bold text-gray-600"
            aria-label={`Ignorar ${tile.nome}`}
          >
            🙈 Ignorar
          </button>
        </div>
      )}

      {decidido && <Resultado tile={tile} />}
    </div>
  )
}

function Resultado({ tile }: { tile: SeisoTile }): JSX.Element {
  const registrou = tile.decisao === 'registrar'
  const ok = tile.acertou === true
  const texto = ok
    ? registrou
      ? '✅ Anomalia registrada'
      : '✅ Ignorado com razão'
    : registrou
      ? '⚠️ Falso positivo'
      : '❌ Anomalia ignorada'
  return (
    <motion.p
      initial={{ scale: 0.7 }}
      animate={{ scale: 1 }}
      className={`mt-auto pt-2 text-xs font-bold ${ok ? 'text-senso-seiso' : 'text-red-500'}`}
    >
      {texto}
    </motion.p>
  )
}
