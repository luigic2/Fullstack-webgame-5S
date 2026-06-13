// SEISO — Limpar é inspecionar. Esfregue cada área para revelar o achado e,
// com critério, decida: registrar a anomalia ou ignorar (limpeza ≠ etiqueta).
import { AnimatePresence, motion } from 'framer-motion'
import type { Lang } from '../../i18n'
import { t } from '../../i18n'
import { useGameStore } from '../../store/gameStore'
import type { SeisoTile } from '../../types'

interface Props {
  tiles: SeisoTile[]
}

export function SeisoPhase({ tiles }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const lang = useGameStore((s) => s.lang)

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">{t(lang, 'seiso.intro')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            lang={lang}
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
  lang: Lang
  onLimpar: () => void
  onDecidir: (decisao: 'registrar' | 'ignorar') => void
}

function Tile({ tile, lang, onLimpar, onDecidir }: TileProps): JSX.Element {
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
            aria-label={t(lang, 'seiso.scrubAria', { nome: tile.nome })}
          >
            {t(lang, 'seiso.scrub')}
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
            aria-label={t(lang, 'seiso.logAria', { nome: tile.nome })}
          >
            {t(lang, 'seiso.log')}
          </button>
          <button
            onClick={() => onDecidir('ignorar')}
            className="flex-1 rounded-lg bg-gray-200 px-1 py-1.5 text-[11px] font-bold text-gray-600"
            aria-label={t(lang, 'seiso.ignoreAria', { nome: tile.nome })}
          >
            {t(lang, 'seiso.ignore')}
          </button>
        </div>
      )}

      {decidido && <Resultado tile={tile} lang={lang} />}
    </div>
  )
}

function Resultado({ tile, lang }: { tile: SeisoTile; lang: Lang }): JSX.Element {
  const registrou = tile.decisao === 'registrar'
  const ok = tile.acertou === true
  const texto = ok
    ? registrou
      ? t(lang, 'seiso.res.logged')
      : t(lang, 'seiso.res.ignoredOk')
    : registrou
      ? t(lang, 'seiso.res.falsePos')
      : t(lang, 'seiso.res.missed')
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
