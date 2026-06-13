// SEIKETSU — Padronizar. Tire um snapshot do padrão; os itens embaralham e
// você compara cada um com a foto de referência: conforme ou desvio de posição.
import { motion } from 'framer-motion'
import type { Lang } from '../../i18n'
import { t } from '../../i18n'
import { useGameStore } from '../../store/gameStore'
import type { SeiketsuPhase as SeiketsuData, SeiketsuItem, SeiketsuSlot } from '../../types'
import { Button } from '../../ui/Button'

interface Props {
  fase: SeiketsuData
}

export function SeiketsuPhase({ fase }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const lang = useGameStore((s) => s.lang)

  if (!fase.snapshot) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-6 text-center text-white">
        <p className="max-w-sm text-white/80">{t(lang, 'seiketsu.memorize')}</p>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {fase.atual.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
        <Button onClick={() => void dispatch('seiketsu.snapshot', {})}>{t(lang, 'seiketsu.snapshotBtn')}</Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">{t(lang, 'seiketsu.compare')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fase.atual.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            lang={lang}
            onAvaliar={(desvio) => void dispatch('seiketsu.avaliar', { spotId: slot.id, desvio })}
          />
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-marca-laranja">{t(lang, 'seiketsu.refLabel')}</p>
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-marca-azul/30 p-2 sm:grid-cols-3">
        {fase.referencia.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: SeiketsuItem }): JSX.Element {
  return (
    <motion.div layout className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-lg">
      <span className="text-4xl" aria-hidden="true">
        {item.emoji}
      </span>
      <p className="mt-1 text-xs font-semibold text-marca-azul">{item.nome}</p>
    </motion.div>
  )
}

interface SlotProps {
  slot: SeiketsuSlot
  lang: Lang
  onAvaliar: (desvio: boolean) => void
}

function SlotCard({ slot, lang, onAvaliar }: SlotProps): JSX.Element {
  return (
    <motion.div layout className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-lg">
      <span className="text-4xl" aria-hidden="true">
        {slot.emoji}
      </span>
      <p className="mt-1 text-xs font-semibold text-marca-azul">{slot.nome}</p>
      {slot.avaliado === null ? (
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => onAvaliar(false)}
            className="rounded bg-senso-seiso px-2 py-1 text-[11px] font-bold text-white"
            aria-label={t(lang, 'seiketsu.conformeAria', { nome: slot.nome })}
          >
            {t(lang, 'seiketsu.conforme')}
          </button>
          <button
            onClick={() => onAvaliar(true)}
            className="rounded bg-senso-seiri px-2 py-1 text-[11px] font-bold text-white"
            aria-label={t(lang, 'seiketsu.desvioAria', { nome: slot.nome })}
          >
            {t(lang, 'seiketsu.desvio')}
          </button>
        </div>
      ) : (
        <p className={`mt-2 text-xs font-bold ${slot.acertou ? 'text-senso-seiso' : 'text-red-500'}`}>
          {slot.acertou ? '✅ ' : '❌ '}
          {slot.avaliado ? t(lang, 'seiketsu.resDesvio') : t(lang, 'seiketsu.resConforme')}
        </p>
      )}
    </motion.div>
  )
}
